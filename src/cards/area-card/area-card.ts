import '@material/mwc-ripple'
import { LitElement, html, TemplateResult, css, PropertyValues, CSSResultGroup } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers'
import { registerCard } from '../../utils/register-card'
import { CARD_EDITOR_NAME, CARD_NAME } from './area-card-const'
import { CardConfig, cardConfigStruct } from './area-card-config'
import { assert } from 'superstruct'
import { actionHandler } from '../../directives/action-handler-directive'

registerCard({
  type: CARD_NAME,
  name: CARD_NAME,
  description: CARD_NAME,
})

@customElement(CARD_NAME)
export class AreaCard extends LitElement {
  public static getStubConfig(): Record<string, unknown> {
    return {}
  }

  // TODO Add any properities that should cause your element to re-render here
  // https://lit.dev/docs/components/properties/
  @property({ attribute: false }) public hass!: HomeAssistant

  @state() private config!: CardConfig

  // https://lit.dev/docs/components/properties/#accessors-custom
  public setConfig(_config: unknown): void {
    assert(_config, cardConfigStruct)
    const config = _config as CardConfig

    // getLovelace().setEditMode(true)

    this.config = config
  }

  // https://lit.dev/docs/components/lifecycle/#reactive-update-cycle-performing
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false
    }

    return hasConfigOrEntityChanged(this, changedProps, false)
  }

  // https://lit.dev/docs/components/rendering/
  protected render(): TemplateResult | void {
    // TODO Check for stateObj or other necessary things and render a warning if missing

    return html`
      <ha-card
        .header="Hej med dig"
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this.config.hold_action),
          hasDoubleClick: hasAction(this.config.double_tap_action),
        })}
        tabindex="0"
        .label=${`Boilerplate: ${this.config.entity || 'No Entity Defined'}`}
      >
        Mangler der noget indhold?</ha-card
      >
    `
  }

  private _handleAction(event: ActionHandlerEvent): void {
    if (this.hass && this.config && event.detail.action) {
      handleAction(this, this.hass, this.config, event.detail.action)
    }
  }

  // https://lit.dev/docs/components/styles/
  static get styles(): CSSResultGroup {
    return [
      css`
        ha-card {
          aspect-ratio: 1;
        }
      `,
    ]
  }
}
