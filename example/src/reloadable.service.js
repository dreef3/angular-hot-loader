export default class ReloadableService {
  constructor () {
    this.foo = 'bar';
    this.created = new Date();
  }

  getCreated() {
    return this.created;
  }
}
