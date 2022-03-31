import { HomeAssistant } from 'custom-card-helpers'
import { css, CSSResultGroup, html, LitElement, PropertyValueMap, PropertyValues, TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { TemplatedLitElement } from '../../utils/templated-lit-element'
import { CARD_NAME } from './indicator-element-const'

@customElement(CARD_NAME)
export class IndicatorElement extends TemplatedLitElement {
  @property({ attribute: false })
  public hass!: HomeAssistant

  @property({ type: String })
  public icon: string | undefined

  @property({ type: String })
  public primary: string | undefined

  @property({ type: String })
  public secondary: string | undefined

  @property({ type: String })
  public color: string | undefined

  protected render() {
    return html`<div class="sparkle-indicator">
      <div class="icon-wrapper" style="background-color: ${this.getTemplateValue('color')};">
        <ha-icon .icon=${this.getTemplateValue('icon')}></ha-icon>
      </div>
      <div class="text-wrapper">
        <p class="primary">${this.getTemplateValue('primary')}</p>
        <p class="secondary">${this.getTemplateValue('secondary')}</p>
      </div>
    </div>`
  }

  protected updated(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    super.updated(changedProperties)

    const propertiesToWatch = {
      icon: this.icon,
      primary: this.primary,
      secondary: this.secondary,
      color: this.color,
    }

    for (const [property, value] of Object.entries(propertiesToWatch)) {
      if (changedProperties.has(property)) {
        this.reregisterTemplateKey(property, { template: value })
      }
    }
  }

  static get styles() {
    return [
      css`
        .sparkle-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sparkle-indicator .icon-wrapper {
          width: 50px;
          aspect-ratio: 1;
          padding: 1rem;
          border-radius: 1rem;
          box-sizing: border-box;
        }

        .sparkle-indicator .icon-wrapper ha-icon {
          --mdc-icon-size: 100%;
        }

        .sparkle-indicator .text-wrapper p {
          margin: 0;
        }

        .sparkle-indicator .text-wrapper .primary {
          font-weight: bolder;
        }
      `,
    ]
  }
}
