import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { JwtData } from '../../@typings'
import userModel from "../model/userModel";



class Auth {
    static async verifyToken(req: Request, res: Response, next: NextFunction) {

        const token = req.headers["x-access-token"] as string;

        if (!token) {
            return res.status(400).send({ status: res.statusCode, message: "Token is not provided" });
        }


        try {

            const secret = <string>process.env.JWT_SECRET
            const decoded = jwt.verify(token, secret) as JwtData;
            const user = await userModel.findOne({ _id: decoded._id });
            if (!user) {
                return res.status(400).send({ status: res.statusCode, message: "The token you provided is invalid" });
            }

            const { _id, email } = decoded;
            req.body.userInfo = {
                _id,
                email
            }

            next();

        } catch (error) {

            return res.status(400).send({ status: res.statusCode, message: error.message });
        }

    }
}


export default Auth