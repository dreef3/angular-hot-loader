export default class ReloadableController {
  constructor($state, ReloadableService) {
    console.log('[ReloadableController]', ReloadableService);
    this.$state = $state;
    this.value = 'Original';

    this.created = ReloadableService.getCreated();
  }

  reload() {
    this.$state.reload();
  }
}
