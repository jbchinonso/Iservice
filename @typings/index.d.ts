import { Document } from "mongoose";
import { TransportOptions } from "nodemailer";

export interface User {
    _id: string
    isVerified: boolean
    username: string
    email: string
    password: string
    phone: string
    token_hash: string
    transaction_pin?:string
    account_no?: string
    createdAt?: string
    updatedAt?: string
}


export interface JwtData{
    _id: string
    email: string
}

export type mailVariables = {
    name?: string,
    link?: string
}

export interface UserToken extends Document{
    userId: String
    token: string
    createdAt: string
}

export interface mailTransportType extends TransportOptions{
    
}