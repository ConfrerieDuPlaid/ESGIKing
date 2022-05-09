

import {SessionDocument, SessionModel, UserDocument, UserModel, UserProps} from "../models";
import {DateUtils, ErrorResponse, getAuthorization, SecurityUtils} from "../utils";
import {Request} from "express";
import {Roles} from "../utils/roles";
import {Schema} from "mongoose";


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

    public async verifyPermissions (req: Request, requiredRole: Roles) {
        const authToken = getAuthorization(req)
        if (!await this.isValidRoleAndSession(authToken, Roles.toString(requiredRole))) {
            throw new ErrorResponse("You don't have permissions !", 403)
        }
    }

    public async isValidRoleAndSession (token: string | null, expectedRole: string): Promise<boolean> {
        if (!token) return false
        return await this.isValidSession(token) && await this.isValidRole(token, expectedRole)
    }

    public async isValidRole  (token: string, expectedRole: string): Promise<boolean> {
        const user = await UserModel.findOne({
            sessions: token
        })
        return user.role === expectedRole
    }

    public async isValidSession (token: string): Promise<boolean> {
        const session = await SessionModel.findById(token).exec()
        return session.expiration > new Date()
    }

    public async subscribe(user: UserWithoutId, token: string | null): Promise<UserDocument> {
        if (!user.password) {
            throw new ErrorResponse("Missing password !", 400)
        }

        if (user.role === "Admin" && !await this.isValidRoleAndSession(token, "BigBoss")) {
            throw new ErrorResponse("You have to be logged in as a Big Boss to create an Admin", 403)
        }

        let userData = {
            login: user.login,
            password: SecurityUtils.sha512(user.password),
            role: user.role
        }

        const model = new UserModel(userData)
        return model.save()
    }

    public async login(data: UserLoginPwd, platform: string): Promise<SessionDocument | null> {
        const user = await UserModel.findOne({
            login: data.login,
            password: SecurityUtils.sha512(data.password)
        })
        if (user === null) {
            throw new ErrorResponse("Wrong credentials", 404)
        }

        const expDate: Date = DateUtils.addNDaysToNow(7)
        const session = await SessionModel.create({
            platform: platform,
            expiration: expDate,
            user: user._id
        })
        user.sessions.push(session._id)
        user.save()
        return session
    }

    public async getUserIdByAuthToken (userAuth: string): Promise<string | null> {
        const session = await SessionModel.findById(userAuth).exec()
        if (!session) return null
        return session.user
    }
}