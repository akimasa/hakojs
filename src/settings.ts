import hako from "../settings.json";
hako.comFromId = (id) => {
    for (const ele in hako.com) {
        if (hako.com[ele].id === id) {
            return hako.com[ele];
        }
    }
};
export default hako;