export class DateUtils {
    public static addNDaysToNow (days: number): Date {
        let curDate = new Date()
        let newDate = new Date()
        newDate.setDate(curDate.getDate() + days)
        return newDate
    }
}