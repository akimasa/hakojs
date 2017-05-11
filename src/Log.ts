interface LogData {
    log: string;
    turn: number;
    id: number;
    secret: boolean;
}
export default class Log {
    public logData: LogData[];
    constructor() {
        this.logData = [];
    }
    public getLog() {
        return this.logData;
    }
    public pushLog(obj: LogData) {
        this.logData.push(obj);
    }
    public logLandFail(obj: {id: number,
         name: string, comName: string, landName: string, point: string, turn: number}) {
        this.logData.push({
            id: obj.id,
            turn: obj.turn,
            secret: false,
            log: `<span class="name">${obj.name}島</span>で予定されていた`
            + `<span class="command">${obj.comName}</span>は、`
            + `予定地の<span class="point">${obj.point}</span>が`
            + `<b>${obj.landName}</b>だったため中止されました。`,
        });
    }
    public logLandSuc(obj: {id: number,
         name: string, comName: string, point: string, turn: number}) {
        this.logData.push({
            id: obj.id,
            turn: obj.turn,
            secret: false,
            log: `<span class="name">${obj.name}島${obj.point}</span>で`
            + `<span class="command">${obj.comName}</span>が行われました。`,
        });
    }
}