import { Request, Response } from 'express'
import { contactvalidator } from '../middlewares/validator'

import sendContactMail from '../services/contactMailService'


class contactController{

    static async contactUsByMail(req: Request, res: Response) {
        const contactData = req.body

        const { error, value } = contactvalidator.validate(contactData)
        
        if (error) return res.status(400).send({ status: res.statusCode, message: error.message })
        
        const { name, email, subject, message } = value
        
        try {

            await sendContactMail(name, email, subject, message)
            
            return res.status(200).send({status: res.statusCode, message: 'Mail sent'})
            
        } catch (error) {
            
            return res.status(400).send({status: res.statusCode, message: error.message})
            

        }
        
        
    }

}


export default contactController