import { HomeAssistant, LovelaceCard } from 'custom-card-helpers'
import { css, CSSResultGroup, html, PropertyValues, TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { registerCard } from '../../utils/register-card'
import { TITLE_CARD_NAME } from './title-card-const'
import { TitleCardConfig } from './title-card-config'
import { TemplatedLitElement } from '../../utils/templated-lit-element'

registerCard({
  type: TITLE_CARD_NAME,
  name: TITLE_CARD_NAME,
  description: '',
})

@customElement(TITLE_CARD_NAME)
export class TitleCard extends TemplatedLitElement implements LovelaceCard {
  public static async getStubConfig(_hass: HomeAssistant): Promise<TitleCardConfig> {
    return {
      type: `custom:${TITLE_CARD_NAME}`,
      title: 'Hello, {{ user }} !',
      subtitle: 'It is now: {{ now() }}',
    }
  }

  @property({ attribute: false }) public hass!: HomeAssistant

  @state() private _config?: TitleCardConfig

  // todo debounce this
  private _registerTemplateKeys() {
    this.registerTemplateKey('title', { template: this._config?.title ?? '' })
    this.registerTemplateKey('subtitle', { template: this._config?.subtitle ?? '' })
  }

  getCardSize(): number | Promise<number> {
    return 1
  }

  setConfig(config: TitleCardConfig): void {
    if (this._config?.title !== config.title) {
      this.unregisterTemplateKey('title')
    }

    if (this._config?.subtitle !== config.subtitle) {
      this.unregisterTemplateKey('subtitle')
    }

    this._config = config
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps)
    if (!this._config || !this.hass) {
      return
    }

    this._registerTemplateKeys()
  }

  public connectedCallback() {
    super.connectedCallback()
    this._registerTemplateKeys()
  }

  protected render(): TemplateResult {
    if (!this._config || !this.hass) {
      return html``
    }

    const title = this.getTemplateValue('title')
    const subtitle = this.getTemplateValue('subtitle')

    return html`
      <div class="header">
        ${title ? html`<h1 class="title">${title}</h1>` : null}
        ${subtitle ? html`<h2 class="subtitle">${subtitle}</h2>` : null}
      </div>
    `
  }

  static get styles(): CSSResultGroup {
    return [
      css`
        // todo
      `,
    ]
  }
}
