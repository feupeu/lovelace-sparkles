import { HomeAssistant } from 'custom-card-helpers'
import { UnsubscribeFunc } from 'home-assistant-js-websocket'
import { LitElement } from 'lit'
import { state } from 'lit/decorators.js'
import { RenderTemplateResult, subscribeRenderTemplate } from './ws-templates'

interface TemplateRegistration {
  template: string
  entity_ids?: string[]
  variables?: Record<string, unknown>
}

export abstract class TemplatedLitElement extends LitElement {
  abstract hass?: HomeAssistant

  @state() private _results: Record<string, RenderTemplateResult> = {}
  @state() private _unsubscribers: Map<string, UnsubscribeFunc> = new Map()

  public disconnectedCallback() {
    super.disconnectedCallback()
    this.disconnectTemplateKeys()
  }

  protected getTemplateValue(key: string) {
    return this._results[key]?.result ?? ''
  }

  protected async registerTemplateKey(key: string, registration: TemplateRegistration) {
    const { template, entity_ids = [], variables = {} } = registration

    // TODO Check if there is any printed templating i.e contains "{{" then register, else just print the value it self

    if (this._unsubscribers.has(key)) {
      return // already registered
    }

    this._unsubscribers.set(key, () => {})

    try {
      const unsubscribeFunc = await subscribeRenderTemplate(
        this.hass!.connection,
        (result) => {
          this._results = {
            ...this._results,
            [key]: result,
          }
        },
        {
          template,
          entity_ids,
          variables,
        }
      )
      this._unsubscribers.set(key, unsubscribeFunc)
    } catch (error: any) {
      console.log('error', error)

      const result = {
        result: error.message,
        listeners: {
          all: false,
          domains: [],
          entities: [],
          time: false,
        },
      }

      if (this._results[key]?.result !== result.result) {
        this._results = {
          ...this._results,
          [key]: result,
        }
      }

      this._unsubscribers.delete(key)
    }
  }

  protected disconnectTemplateKeys() {
    for (const key of this._unsubscribers.keys()) {
      this.disconnectTemplateKey(key)
    }
  }

  protected disconnectTemplateKey(key: string) {
    const unsubscribe = this._unsubscribers.get(key)
    if (unsubscribe === undefined) {
      return // nothing to unsubscribe
    }

    try {
      unsubscribe()
      delete this._results[key]
      this._unsubscribers.delete(key)
    } catch (err: any) {
      if (err.code === 'not_found' || err.code === 'template_error') {
        // If we get here, the connection was probably already closed. Ignore.
      } else {
        throw err
      }
    }
  }
}
