

export class ReductionService{

    private static instance: ReductionService

    public static getInstance (): ReductionService {
        if (ReductionService.instance === undefined) {
            ReductionService.instance = new ReductionService()
        }
        return ReductionService.instance
    }

}