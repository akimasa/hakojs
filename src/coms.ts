const coms = {
    coms: {
        "prepare": {
            name: "整地",
            cost: 5,
            id: 1,
        },
        "prepare2": {
            name: "地ならし",
            cost: 100,
            id: 2,
        },
        "reclaim": {
            name: "埋め立て",
            cost: 150,
            id: 3,
        },
        "destroy": {
            name: "掘削",
            cost: 200,
            id: 4,
        },
        "selltree": {
            name: "伐採",
            cost: 0,
            id: 5,
        },
        "plant": {
            name: "植林",
            cost: 50,
            id: 11,
        },
        "farm": {
            name: "農場整備",
            cost: 20,
            id: 12,
        },
        "factory": {
            name: "工場建設",
            cost: 100,
            id: 13,
        },
        "mountain": {
            name: "採掘場整備",
            cost: 300,
            id: 14,
        },
        "base": {
            name: "ミサイル基地建設",
            cost: 300,
            id: 15,
        },
        "dbase": {
            name: "防衛施設建設",
            cost: 800,
            id: 16,
        },
        "sbase": {
            name: "海底基地建設",
            cost: 8000,
            id: 17,
        },
        "monument": {
            name: "記念碑建造",
            cost: 9999,
            id: 18,
        },
        "haribote": {
            name: "ハリボテ設置",
            cost: 1,
            id: 19,
        },
        "missileNM": {
            name: "ミサイル発射",
            cost: 20,
            id: 31,
        },
        "missilePP": {
            name: "PPミサイル発射",
            cost: 50,
            id: 32,
        },
        "missileST": {
            name: "STミサイル発射",
            cost: 50,
            id: 33,
        },
        "missileLD": {
            name: "陸地破壊弾発射",
            cost: 100,
            id: 34,
        },
        "sendmonster": {
            name: "怪獣派遣",
            cost: 3000,
            id: 35,
        },
        "donothing": {
            name: "資金繰り",
            cost: 0,
            id: 41,
        },
        "sell": {
            name: "食料輸出",
            cost: -100,
            id: 42,
        },
        "money": {
            name: "資金援助",
            cost: 100,
            id: 43,
        },
        "food": {
            name: "食糧援助",
            cost: -100,
            id: 44,
        },
        "propaganda": {
            name: "誘致活動",
            cost: 1000,
            id: 45,
        },
        "giveup": {
            name: "島の放棄",
            cost: 0,
            id: 46,
        },
    },
    comFromId: (id: number): {name: string, cost: number, id: number} => {
        for (const ele in coms.coms) {
            if (coms.coms[ele].id === id) {
                return coms.coms[ele];
            }
        }
    },
};

export default coms;