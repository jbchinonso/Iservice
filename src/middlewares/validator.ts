import Joi from 'joi'
import mongoose from 'mongoose'

export const userValidator = Joi.object({
    username: Joi.string().lowercase().trim().required(),
    email: Joi.string().email().min(5).max(100).lowercase().trim().required(),
    password: Joi.string().min(8).required(),
    phone: Joi.string().length(14).pattern(/^\+234[0-9]+$/),
    transaction_pin: Joi.string().min(4).max(4),
    account_no: Joi.string().min(10).max(10)

})

export const loginValidator = Joi.object({
    email: Joi.string().email().min(5).max(100).lowercase().trim().required(),
    password: Joi.string().required()
})


export const pinValidator = Joi.string().min(4).max(4).required()


export const accountNoValidator = Joi.string().length(10).pattern(/^[0-9]+$/).required()


export const emailValidator = Joi.string().email().min(5).max(100).lowercase().trim().required()

export const passwordValidator = Joi.string().min(8).required()


export const idValidator = mongoose.Types.ObjectId


export const contactvalidator = Joi.object({
    name: Joi.string().min(2).trim().required(),
    email: Joi.string().email().min(5).max(100).lowercase().trim().required(),
    subject: Joi.string().min(5).required(),
    message: Joi.string().min(10).required()
})
