export class ErrorResponse {

    private static errMsgMap = {
        400: "Bad request",
        412: "Precondition failed"
    }

    constructor(public message: string, public status: number) { }

    // public static throwDefaultErr (errNo: number) {
    //     throw new ErrorResponse(this.errMsgMap[errNo], errNo)
    // }
}