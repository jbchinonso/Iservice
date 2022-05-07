import { Request, Response } from 'express'
import bcrypt, { genSalt } from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import sendMail from '../services/mailService'

import { userValidator, loginValidator, pinValidator, accountNoValidator } from '../middlewares/validator'
import userModel from '../model/userModel'
import { User } from '../../@typings'



class UserController {

    /**
     * 
     * @param req 
     * @param res 
     */

    static async signUp(req: Request, res: Response) {

        const userData = req.body;
        const { error, value } = userValidator.validate(userData);
        if (error) return res.status(400).json({ status: res.statusCode, message: error.message })

        const existingUser = await userModel.findOne({ email: value.email }).exec()
        if (existingUser) return res.status(400).send({ status: res.statusCode, message: `${value.email} is already Registered` })

        const hash = crypto.randomBytes(64).toString('hex');
        const hashedPassword = await bcrypt.hash(value.password, await bcrypt.genSalt(8));

        value.token_hash = hash
        value.password = hashedPassword

        const template = './templates/signupTemplate.handlebars'

        const mail_verification_link = `https://${req.headers.host}/users/verify-email?token=${hash}`
        const subject = "Welcome to Gmartpay"

        try {
            await new userModel(value).save()
            await sendMail(value.email, subject, { name: value.username, link: mail_verification_link }, template)
            return res.status(201).send({ status: res.statusCode, message: "we just sent you a mail. please verify your email address" });

        } catch (error) {
            await userModel.findOneAndDelete({ email: value.email })
            return res.status(400).send({ status: res.statusCode, message: error.message });
        }


    }

    /**
     * Account Verification Route
     * 
     * @param req 
     * @param res 
     */

    static async verifyAccount(req: Request, res: Response) {
        const token = req.query.token;

        const user = await userModel.findOne({ token_hash: token })

        if (!user) return res.status(400).send({ status: res.statusCode, message: 'Invalid user verification Link' })

        try {
            await userModel.findOneAndUpdate({ token_hash: token }, {
                $set: {
                    token_hash: '',
                    isVerified: true,
                    updatedAt: new Date().toISOString()
                }
            })
            return res.status(200).send({ status: res.statusCode, message: 'Your account has been successfully verified' })

        } catch (error) {

            return res.status(400).send({ status: res.statusCode, message: error.message })
        }


    }

    /**
     * Login Route
     * 
     * @param req 
     * @param res 
     */

    static async login(req: Request, res: Response) {
        const userData = req.body;
        const { error, value } = loginValidator.validate(userData);

        if (error) return res.status(400).send({ status: res.statusCode, message: error.message });

        const user = (await userModel.findOne({ email: value.email }) as unknown) as Promise<User>;

        if (!user) return res.status(400).send({ status: res.statusCode, message: 'Invalid Credential' })

        if (!(await user).isVerified) return res.status(400).send({ status: res.statusCode, message: 'Please verify your account' })

        if (!bcrypt.compareSync(value.password, (await user).password)) {
            return res.status(400).send({ status: res.statusCode, message: 'Invalid Credential' })
        }

        const signData = {
            _id: (await user)._id,
            email: (await user).email
        }

        const secret = <string>process.env.JWT_SECRET;
        const token = jwt.sign({ ...signData }, secret, { expiresIn: "1h" });
        return res.status(200).send({ status: res.statusCode, token: token });
    }


    static async setTransactionPin(req: Request, res: Response) {
        const pin = req.body.pin
        const id = req.body.userInfo._id

        const { error, value } = pinValidator.validate(pin)

        if (error) return res.status(400).send({ status: res.statusCode, message: error.message })

        try {

            await userModel.findOneAndUpdate({ _id: id }, {
                $set: {
                    transaction_pin: value
                }
            })

            return res.status(200).send({ status: res.statusCode, message: 'transaction pin updated successfully' })

        } catch (error) {

            return res.status(401).send({ status: res.statusCode, message: error.message })
        }
    }

    /**
     * get the user profile
     * @param req 
     * @param res 
     */

    static async getProfile(req: Request, res: Response) {
        const user_id = req.body.userInfo._id

        try {
            const user = (await userModel.findOne({ _id: user_id }) as unknown) as User
            const { _id, username, email, phone, transaction_pin, account_no, createdAt, updatedAt } = user


            return res.status(200).send({
                status: res.statusCode,
                _id,
                username,
                email,
                phone,
                transaction_pin,
                account_no,
                createdAt,
                updatedAt
            })

        } catch (error) {

            return res.status(400).send({ status: res.statusCode, message: error.message })

        }


    }


    /**
     * Update user profile
     * 
     * @param req 
     * @param res 
     */

    static async updateProfile(req: Request, res: Response) {
        const profile = req.body
        const user_id = req.body.userInfo._id

        delete profile.userInfo

        const { error, value } = userValidator.validate(profile);

        if (error) return res.status(400).send({ status: res.statusCode, message: error.message })

        delete value.email
        delete value.password

        try {
            await userModel.findOneAndUpdate({ _id: user_id }, {
                $set: {
                    updatedAt: new Date().toISOString(),
                    ...value
                }
            })

            return res.status(200).send({ status: res.statusCode, message: 'user information successfully updated' })

        } catch (error) {

            return res.status(400).send({ status: res.statusCode, message: error.message })

        }
    }

    static async addBankAccount(req: Request, res: Response) {
        const user_id = req.body.userInfo._id
        const { account_no } = req.body

        const { error, value } = accountNoValidator.validate(account_no)

        if (error) return res.status(400).send({ status: res.statusCode, message: error.message })

        try {

            await userModel.findOneAndUpdate({ _id: user_id }, {
                $set: {
                    account_no: value
                }
            })

            res.status(200).send({ status: res.statusCode, message: 'Account number added Successfully' })

        } catch (error) {

            res.status(400).send({ status: res.statusCode, message: error.message })

        }


    }

    


}


export default UserController