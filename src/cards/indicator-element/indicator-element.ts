import { css, CSSResultGroup, html, LitElement, TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { CARD_NAME } from './indicator-element-const'

@customElement(CARD_NAME)
export class IndicatorElement extends LitElement {
  @property({ type: String })
  public icon: string | undefined

  @property({ type: String })
  public primary: string | undefined

  @property({ type: String })
  public secondary: string | undefined

  @property({ type: String })
  public color: string | undefined

  protected render(): TemplateResult | void {
    return html` <div class="sparkle-indicator">
      <div class="icon-wrapper" style="background:${this.color};">
        <ha-icon .icon=${this.icon}></ha-icon>
      </div>
      <div class="text-wrapper">
        <p class="primary">${this.primary}</p>
        <p class="secondary">${this.secondary}</p>
      </div>
    </div>`
  }

  static get styles(): CSSResultGroup {
    return [
      css`
        .sparkle-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sparkle-indicator .icon-wrapper {
          background: red;
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
