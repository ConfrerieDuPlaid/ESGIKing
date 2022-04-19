import {ErrorResponse} from "./error.utils";

export class DataUtils {
    public static hasMandatoryParams (object: any, mandatoryParams: string[]): boolean {
        mandatoryParams.forEach((p) => {
            if (!object[p]) {
                throw new ErrorResponse("Missing parameters", 412)
            }
        })
        return true
    }
}