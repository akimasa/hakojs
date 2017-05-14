export interface LogData {
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
        const {id, name, comName, landName, point, turn} = obj;
        this.logData.push({
            id,
            turn,
            secret: false,
            log: `<span class="name">${name}島</span>で予定されていた`
            + `<span class="command">${comName}</span>は、`
            + `予定地の<span class="point">${point}</span>が`
            + `<b>${landName}</b>だったため中止されました。`,
        });
    }
    public logLandSuc(obj: {id: number,
         name: string, comName: string, point: string, turn: number}) {
        const {id, turn, name, point, comName} = obj;
        this.logData.push({
            id,
            turn,
            secret: false,
            log: `<span class="name">${name}島${point}</span>で`
            + `<span class="command">${comName}</span>が行われました。`,
        });
    }
}