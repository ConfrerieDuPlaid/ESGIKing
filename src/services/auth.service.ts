import {UserDocument, UserModel, UserProps} from "../models";
import {ErrorResponse, SecurityUtils} from "../utils";
import {SessionDocument, SessionModel} from "../models";

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

    public async isValidRole(token: string | null, expectedRole: string): Promise<boolean> {
        if (token === null || token === "") return false
        const session = await SessionModel.findOne({
            _id: token
        })
        const user = await UserModel.findOne({
            _id: session.user
        })
        return user.role === expectedRole
    }

    public async subscribe(user: UserWithoutId, token: string | null): Promise<UserDocument> {
        if (!user.password) {
            throw new ErrorResponse("Missing password !", 400)
        }

        if (user.role === "Admin" && !await this.isValidRole(token, "BigBoss")) {
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

        const curDate = new Date()
        const expDate = new Date(curDate.getTime() + (7*24*3600))
        const session = await SessionModel.create({
            platform: platform,
            expiration: expDate,
            user: user._id
        })
        user.sessions.push(session._id)
        user.save()
        return session
    }
}