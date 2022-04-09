export class DateUtils {
    public static addNDaysToNow (n: number): Date {
        let curDate = new Date()
        let newDate = new Date()
        newDate.setDate(curDate.getDate() + n)
        return newDate
    }
}