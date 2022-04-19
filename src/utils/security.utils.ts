import * as crypto from "crypto"
import {Request} from "express";
import {Roles} from "./roles";
import {AuthService} from "../services";
import {ErrorResponse} from "./error.utils";

export class SecurityUtils {
    public static sha512 (str: string): string {
        const hash = crypto.createHash("sha512")
        hash.update(str)
        return hash.digest("hex")
    }
}

export function getAuthorization (req: Request): string {
    let authBasic = req.headers.authorization
    if (authBasic === null || authBasic === "") return ""
    let authToken = ""
    if (typeof authBasic === "string") {
        const authStr = authBasic.split(" ")
        authToken = authStr[1]
    }
    return authToken
}