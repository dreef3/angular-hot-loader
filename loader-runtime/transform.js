class HotExport {
    constructor (value) {
        this.__hot = true;
        this.reload(value);
    }

    reload (value) {
        this.timestamp = new Date();
        this.value = value;
    }

    get () {
        return this.value;
    }
}

function hotExportResolver (e) {
    function hotExport () {
        return e;
    }

    hotExport.__hot = true;
    return hotExport;

}

export default function transform (m) {
    if (m.__export) {
        m.__export().reload(m.exports);
    } else {
        let e = new HotExport(m.exports);
        m.__export = m.exports = hotExportResolver(e);
    }

    return true;
}
