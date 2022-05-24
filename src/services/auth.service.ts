import {SessionDocument, SessionModel, UserDocument, UserModel, UserProps} from "../models";
import {DateUtils, ErrorResponse, getAuthorization, SecurityUtils} from "../utils";
import {Request} from "express";
import {Roles} from "../utils/roles";


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

    public async verifyPermissions (req: Request, requiredRole: Roles | Roles[]) {
        const authToken = getAuthorization(req)
        let permAllowed = false ;
        if (Array.isArray(requiredRole)) {
            for (let i = 0 ; i < requiredRole.length ; ++i) {
                permAllowed = permAllowed || await this.isValidRoleAndSession(authToken, Roles.toString(requiredRole[i]))
            }
        } else {
            permAllowed = await this.isValidRoleAndSession(authToken, Roles.toString(requiredRole))
        }
        if (!permAllowed) throw new ErrorResponse("You don't have permissions !", 403)
    }

    public async isValidRoleAndSession (token: string | null, expectedRole: string | string[]): Promise<boolean> {
        if (!token) return false
        return await this.isValidSession(token) && await this.isValidRole(token, expectedRole)
    }

    public async isValidRole  (token: string, expectedRole: string | string[]): Promise<boolean> {
        const user = await UserModel.findOne({
            $or: [
                {sessions: token},
                {_id: token}
            ]
        })
        if (typeof expectedRole === "string") return user.role === expectedRole
        return expectedRole.indexOf(user.role) !== -1
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

    async verifyIfUserRequestedIsTheUserConnected(authToken: string, userId: string) : Promise<Boolean>{
        const currentUser = await UserModel.findOne({
            sessions: authToken
        }).exec();

        return userId === currentUser._id;
    }

    public async getUserIdByAuthToken (userAuth: string): Promise<string> {
        const session = await SessionModel.findById(userAuth).exec()
        if (!session) throw new ErrorResponse("User not found", 404)
        return session.user
    }
}
