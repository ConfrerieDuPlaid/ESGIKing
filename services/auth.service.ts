import {UserDocument, UserModel, UserProps} from "../models";
import {SecurityUtils} from "../utils";
import {SessionDocument, SessionModel} from "../models";
import mongoose from "mongoose";

type UserWithoutId = Partial<UserProps>
type UserLoginPwd = Pick<UserProps, "login" | "password">

export class AuthService {
    private static instance: AuthService

    public static getInstance (): AuthService {
        if (AuthService.instance === undefined) {
            AuthService.instance = new AuthService()
        }
        return AuthService.instance
    }

    private constructor() { }

    public async subscribe (user: UserWithoutId): Promise<UserDocument> {
        if (!user.password) {
            throw new Error("Missing password !")
        }

        const model = new UserModel({
            login: user.login,
            password: SecurityUtils.sha512(user.password),

        })
        return model.save()
    }

    public async login(data: UserLoginPwd, platform: string): Promise<SessionDocument | null> {
        const user = await UserModel.findOne({
            login: data.login,
            password: SecurityUtils.sha512(data.password)
        })
        if (user === null) {
            throw Error("Wrong credentials")
        }

        const curDate = new Date()
        const expDate = new Date(curDate.getTime() + (7*24*3600))
        const session = await SessionModel.create({
            platform: platform,
            expiration: expDate,
            user: user._id
        })
        if (session instanceof SessionModel) {
            user.sessions.push(session._id)
            user.save()
            return session
        }
        throw new Error("Couldn't init session")
    }
}