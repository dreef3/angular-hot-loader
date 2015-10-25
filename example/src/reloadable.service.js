export default class ReloadableService {
  constructor () {
    this.foo = 'bar1';
    this.created = new Date();
  }

  getCreated() {
    return this.created;
  }
}
