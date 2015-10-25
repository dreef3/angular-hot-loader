class HotExport {
  constructor (e) {
    this.e = e;
    this.__hot = true;
  }

  reload (e) {
    this.e = e;
  }

  get () {
    return this.e;
  }
}

function hotExportResolver(e) {
  function hotExport() {
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
