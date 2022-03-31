import { HomeAssistant } from 'custom-card-helpers'
import fastDeepEqual from 'fast-deep-equal'
import { UnsubscribeFunc } from 'home-assistant-js-websocket'
import { LitElement } from 'lit'
import { state } from 'lit/decorators.js'
import { RenderTemplateResult, subscribeRenderTemplate } from './ws-templates'

interface TemplateRegistration {
  template: string
  entity_ids?: string[]
  variables?: Record<string, unknown>
}

interface MaybeTemplateRegistration extends Omit<TemplateRegistration, 'template'> {
  template?: string
}

export abstract class TemplatedLitElement extends LitElement {
  abstract hass?: HomeAssistant

  @state() private _results: Record<string, RenderTemplateResult> = {}
  @state() private _unsubscribers: Map<string, UnsubscribeFunc> = new Map()

  public disconnectedCallback() {
    super.disconnectedCallback()
    this.unregisterTemplateKeys()
  }

  protected getTemplateValue(key: string) {
    return this._results[key]?.result ?? ''
  }

  protected reregisterTemplateKey(key: string, maybeRegistration: MaybeTemplateRegistration) {
    this.unregisterTemplateKey(key)
    if (maybeRegistration.template !== undefined) {
      this.registerTemplateKey(key, {
        template: maybeRegistration.template,
        entity_ids: maybeRegistration.entity_ids,
        variables: maybeRegistration.variables,
      })
    }
  }

  protected async registerTemplateKey(key: string, registration: TemplateRegistration) {
    const { template, entity_ids = [], variables = {} } = registration

    // template is not actually a template, not need to register anything
    if (template.includes('{{') === false && this._results[key]?.result !== template) {
      this._results = {
        ...this._results,
        [key]: {
          result: template,
          listeners: {
            all: false,
            domains: [],
            entities: [],
            time: false,
          },
        },
      }

      return // don't do anything else
    }

    if (this._unsubscribers.has(key)) {
      return // already registered
    }

    this._unsubscribers.set(key, () => {})

    try {
      const unsubscribeFunc = await subscribeRenderTemplate(
        this.hass!.connection,
        (result) => {
          // update _results, if the evaluation is different
          if (fastDeepEqual(result, this._results[key]) === false) {
            this._results = {
              ...this._results,
              [key]: result,
            }
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

  protected unregisterTemplateKeys() {
    for (const key of this._unsubscribers.keys()) {
      this.unregisterTemplateKey(key)
    }
  }

  protected unregisterTemplateKey(key: string) {
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
