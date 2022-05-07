import { Request, Response } from 'express'
import bcrypt, { genSalt } from 'bcrypt'
import crypto from 'crypto'
import sendMail from '../services/mailService'

import userModel from '../model/userModel'
import tokenModel from '../model/tokenModel'
import { User, UserToken } from '../../@typings'

import {emailValidator, passwordValidator, idValidator} from '../middlewares/validator'


class PasswordController {

    /**
     * allow users to request for password change
     * 
     * @param req 
     * @param res 
     */
    static async requestPasswordReset(req: Request, res: Response) {
        const { email } = req.body
        const { error, value } = emailValidator.validate(email)

        if (error) return res.status(200).send({ status: res.statusCode, message: error.message })

        const user = (await userModel.findOne({ email: value }) as unknown) as User

        if (!user) return res.status(400).send({ status: res.statusCode, message: 'user does not exist' })

        const token = tokenModel.findOne({ userId: user._id })

        if (token) await token.deleteOne()

        const resetToken = crypto.randomBytes(32).toString("hex");

        const hash = await bcrypt.hash(resetToken, await genSalt(8))

        await new tokenModel({
            userId: user._id,
            token: hash,
            createdAt: Date.now()
        }).save()

        
        const link = `${process.env.FRONTEND_RESET_LINK}?token=${resetToken}&&userId=${user._id}`;
        const template = './templates/resetPasswordTemplate.handlebars'
        const subject = "Password Reset"
        try {
            sendMail(user.email, subject, { name: user.username, link: link }, template);
            return res.status(200).send({ status: res.statusCode, message: 'please go to your mail to reset your password' })

        } catch (error) {
            return res.status(400).send({ status: res.statusCode, message: error.message })
        }
    }


/**
 * verify that the users are the real owners of the account
 * 
 * @param req 
 * @param res 
 */
    static async comfirmPasswordResetRequest(req:Request, res:Response) {
        const token = req.query.token
        const userId = req.query.userId

        const passwordResetToken = await tokenModel.findOne({ userId })  as UserToken
        
        if (!passwordResetToken) throw new Error("Invalid or expired password reset token")
        
        const isValid = bcrypt.compare(token, passwordResetToken.token)

        if (!isValid) throw new Error("Invalid or expired password reset token")
        
        return res.status(200).send({status: res.statusCode, message: 'Token verified'})
    } 


/**
 * set the password to a new password
 * 
 * @param req 
 * @param res 
 */
    static async resetPassword(req: Request, res: Response) {
        const { newPassword, userId} = req.body

        const { error, value } = passwordValidator.validate(newPassword)
        const isValid = idValidator.isValid(userId)
        
        if (error) return res.status(400).send({ status: res.statusCode, message: error.message })
        if (!isValid) return res.status(400).send({ status: res.statusCode, message: 'Invalid user id' })

        const hashedPassword = await bcrypt.hash(value, await genSalt(8));
        
        try {
            
            await userModel.findOneAndUpdate({ _id: userId }, {
                $set: {
                    password: hashedPassword
                }
            })

            res.status(200).send({status: res.statusCode, message: 'password changed successfully'})

        } catch (error) {
            
            res.status(400).send({status: res.statusCode, message: error.message})

        }
        
    }

}


export default PasswordController