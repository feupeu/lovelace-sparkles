import { HomeAssistant, LovelaceCard, LovelaceCardEditor } from 'custom-card-helpers'
import { UnsubscribeFunc } from 'home-assistant-js-websocket'
import { css, CSSResultGroup, html, PropertyValues, TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
// import { cardStyle } from '../../utils/card-styles'
import { registerCard } from '../../utils/register-card'
import { RenderTemplateResult, subscribeRenderTemplate } from '../../utils/ws-templates'
import { TITLE_CARD_NAME } from './title-card-const'
import { TitleCardConfig } from './title-card-config'
import { TemplatedLitElement } from '../../utils/templated-lit-element'

registerCard({
  type: TITLE_CARD_NAME,
  name: TITLE_CARD_NAME,
  description: '',
})

const TEMPLATE_KEYS = ['title', 'subtitle'] as const
type TemplateKey = typeof TEMPLATE_KEYS[number]

@customElement(TITLE_CARD_NAME)
export class TitleCard extends TemplatedLitElement implements LovelaceCard {
  // public static async getConfigElement(): Promise<LovelaceCardEditor> {
  //   await import('./title-card-editor')
  //   return document.createElement(TITLE_CARD_EDITOR_NAME) as LovelaceCardEditor
  // }

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
      this.disconnectTemplateKey('title')
    }

    if (this._config?.subtitle !== config.subtitle) {
      this.disconnectTemplateKey('subtitle')
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

  public isTemplate(key: TemplateKey) {
    const value = this._config?.[key]
    return value?.includes('{')
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
        h1 {
          color: pink;
        }
      `,
    ]
  }
}
