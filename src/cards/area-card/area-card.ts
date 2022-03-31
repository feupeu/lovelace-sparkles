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

    console.log(this.getTemplateValue('layout'))

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
        class="${this.getTemplateValue('layout') === 'horizontal' ? 'horizontal-layout' : 'vertical-layout'}"
        .label=${`Boilerplate: ${this.config.entity || 'No Entity Defined'}`}
      >
        <div class="title-wrapper">
          <ha-icon .icon=${this.getTemplateValue('icon')}></ha-icon>
          <div class="text-wrapper">
            <p class="primary">Static primary</p>
            <p class="secondary">Static secondary</p>
          </div>
        </div>
          
        <div class="indicators">
          ${this.config.indicators.map((_, i) => {
            return html` <dev-sparkles-indicator-element
              icon="${this.getTemplateValue('indicator_' + i + '_icon')}"
              color="${this.getTemplateValue('indicator_' + i + '_color')}"
              primary="${this.getTemplateValue('indicator_' + i + '_primary')}"
              secondary="${this.getTemplateValue('indicator_' + i + '_secondary')}"
            ></dev-sparkles-indicator-element>`
          })}
        <div class="indicators">
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
    this.registerTemplateKey('layout', { template: this.config?.layout ?? '' })

    this.config?.indicators.forEach((indicator, i) => {
      this.registerTemplateKey('indicator_' + i + '_icon', { template: indicator?.icon })
      this.registerTemplateKey('indicator_' + i + '_primary', { template: indicator?.primary })
      this.registerTemplateKey('indicator_' + i + '_secondary', { template: indicator?.secondary })
      this.registerTemplateKey('indicator_' + i + '_color', { template: indicator?.color })
    })
  }

  // https://lit.dev/docs/components/styles/
  static get styles(): CSSResultGroup {
    return [
      css`
        ha-card {
          display: flex;
          padding: 1rem;
          gap: 1rem;
          flex-direction: column;
        }

        ha-card.horizontal-layout {
          flex-direction: row;
        }

        .title-wrapper {
          flex-direction: column;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .title-wrapper .text-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }

        .title-wrapper .text-wrapper p {
          margin: 0;
        }

        .title-wrapper .text-wrapper .primary {
          font-size: 1.3rem;
        }

        .title-wrapper ha-icon {
          width: 100px;
          height: 100px;
          aspect-ratio: 1;
          --mdc-icon-size: 100%;
        }
      `,
    ]
  }
}
