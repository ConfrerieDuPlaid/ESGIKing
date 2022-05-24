import {Request} from 'express';

export abstract class HttpUtils {
    public static getFullUrlOf(request: Request) {
        return HttpUtils.getBaseUrlOf(request) + request.originalUrl  + "/";
    }

    public static getBaseUrlOf(request: Request) {
        return request.protocol + '://' + request.get('host');
    }
}