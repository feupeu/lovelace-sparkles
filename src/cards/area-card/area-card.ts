import '@material/mwc-ripple'
import type { Ripple } from '@material/mwc-ripple'
import { RippleHandlers } from '@material/mwc-ripple/ripple-handlers'

import { LitElement, html, TemplateResult, css, PropertyValues, CSSResultGroup } from 'lit'
import { customElement, eventOptions, property, queryAsync, state } from 'lit/decorators.js'
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
import { TemplatedLitElement } from '../../utils/templated-lit-element'

registerCard({
  type: CARD_NAME,
  name: CARD_NAME,
  description: CARD_NAME,
})

@customElement(CARD_NAME)
export class AreaCard extends TemplatedLitElement {
  public static getStubConfig(): Record<string, unknown> {
    return {}
  }

  // TODO Add any properities that should cause your element to re-render here
  // https://lit.dev/docs/components/properties/
  @property({ attribute: false }) public hass!: HomeAssistant

  @state() private config!: CardConfig

  @queryAsync('mwc-ripple') private _ripple!: Promise<Ripple | null>

  @state() private _shouldRenderRipple = false

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

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps)
    if (this.hass != null) {
      this._registerTemplateKeys()
    }
  }

  // https://lit.dev/docs/components/rendering/
  protected render(): TemplateResult | void {
    // TODO Check for stateObj or other necessary things and render a warning if missing

    return html`
      <ha-card
        @focus=${this.handleRippleFocus}
        @blur=${this.handleRippleBlur}
        @mousedown=${this.handleRippleActivate}
        @mouseup=${this.handleRippleDeactivate}
        @touchstart=${this.handleRippleActivate}
        @touchend=${this.handleRippleDeactivate}
        @touchcancel=${this.handleRippleDeactivate}
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this.config.hold_action),
          hasDoubleClick: hasAction(this.config.double_tap_action),
        })}
        tabindex="0"
        .label=${`Boilerplate: ${this.config.entity || 'No Entity Defined'}`}
      >
        <ha-state-icon .icon=${this.getTemplateValue('icon')}></ha-state-icon>
        <mwc-ripple></mwc-ripple>
      </ha-card>
    `
  }

  private _rippleHandlers: RippleHandlers = new RippleHandlers(() => {
    this._shouldRenderRipple = true
    return this._ripple
  })

  @eventOptions({ passive: true })
  private handleRippleActivate(evt?: Event) {
    this._rippleHandlers.startPress(evt)
  }

  private handleRippleDeactivate() {
    this._rippleHandlers.endPress()
  }

  private handleRippleFocus() {
    this._rippleHandlers.startFocus()
  }

  private handleRippleBlur() {
    this._rippleHandlers.endFocus()
  }

  private _handleAction(event: ActionHandlerEvent): void {
    if (this.hass && this.config && event.detail.action) {
      handleAction(this, this.hass, this.config, event.detail.action)
    }
  }

  private _registerTemplateKeys() {
    this.registerTemplateKey('icon', { template: this.config?.icon ?? '' })
  }

  // https://lit.dev/docs/components/styles/
  static get styles(): CSSResultGroup {
    return [
      css`
        ha-card {
          display: flex;
          align-items: center;
          justify-content: center;
          aspect-ratio: 1;
        }
      `,
    ]
  }
}
