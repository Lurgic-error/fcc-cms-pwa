<script setup>
defineProps({
  steps: { type: Array, default: () => [] },
})

const emit = defineEmits(['jump'])
</script>

<template>
  <aside class="commission-wizard-sidebar">
    <div class="commission-wizard-sidebar__desktop">
      <div class="commission-wizard-sidebar__panel">
        <div class="commission-wizard-sidebar__intro">
          <p class="commission-wizard-sidebar__eyebrow">Commission editor</p>
          <h2>Wizard steps</h2>
          <p>Move through the commission profile in a consistent, section-by-section flow.</p>
        </div>

        <nav aria-label="Commission wizard steps" class="commission-wizard-sidebar__nav">
          <button
            v-for="step in steps"
            :key="step.key"
            type="button"
            class="commission-wizard-sidebar__step"
            :class="{
              'is-current': step.current,
              'is-complete': step.complete,
              'is-error': step.error,
              'is-locked': step.locked,
            }"
            :disabled="step.locked"
            @click="emit('jump', step.index)"
          >
            <span class="commission-wizard-sidebar__index">
              <span v-if="step.complete" aria-hidden="true">✓</span>
              <span v-else>{{ step.index + 1 }}</span>
            </span>
            <span class="commission-wizard-sidebar__copy">
              <strong>{{ step.title }}</strong>
              <small>
                {{
                  step.error
                    ? 'Validation required'
                    : step.saved
                      ? 'Saved'
                      : step.complete
                        ? 'Complete'
                        : step.locked
                          ? 'Locked'
                          : 'Current section'
                }}
              </small>
            </span>
          </button>
        </nav>
      </div>
    </div>

    <div class="commission-wizard-sidebar__mobile">
      <div class="commission-wizard-sidebar__mobile-scroll">
        <button
          v-for="step in steps"
          :key="`${step.key}-mobile`"
          type="button"
          class="commission-wizard-sidebar__mobile-step"
          :class="{
            'is-current': step.current,
            'is-complete': step.complete,
            'is-error': step.error,
          }"
          :disabled="step.locked"
          @click="emit('jump', step.index)"
        >
          <span>{{ step.index + 1 }}</span>
          <strong>{{ step.title }}</strong>
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.commission-wizard-sidebar {
  min-width: 0;
}

.commission-wizard-sidebar__desktop {
  display: none;
}

.commission-wizard-sidebar__panel {
  position: sticky;
  top: 1.5rem;
  max-height: calc(100vh - 12rem);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-radius: var(--fcc-radius-2xl);
  border: 1px solid var(--fcc-border);
  background: var(--fcc-surface);
  box-shadow: var(--fcc-shadow-soft);
}

.commission-wizard-sidebar__intro {
  margin-bottom: 1.5rem;
  flex-shrink: 0;
}

.commission-wizard-sidebar__intro h2 {
  margin: 0.4rem 0 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--fcc-text);
}

.commission-wizard-sidebar__intro p:last-child {
  margin: 0.6rem 0 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--fcc-text-muted);
}

.commission-wizard-sidebar__eyebrow {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 800;
  color: var(--fcc-primary-600);
}

.commission-wizard-sidebar__nav {
  display: grid;
  gap: 0.65rem;
  overflow-y: auto;
  padding-right: 0.5rem;
  margin-right: -0.5rem;
}

.commission-wizard-sidebar__step {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  width: 100%;
  padding: 0.85rem;
  border-radius: var(--fcc-radius-lg);
  border: 1px solid var(--fcc-border);
  background: var(--fcc-surface-muted);
  text-align: left;
  transition: all 0.2s ease;
}

.commission-wizard-sidebar__step:not(:disabled):hover {
  border-color: var(--fcc-primary-400);
  background: var(--fcc-surface);
}

.commission-wizard-sidebar__step.is-current {
  border-color: var(--fcc-primary-500);
  background: var(--fcc-primary-50);
}

.dark .commission-wizard-sidebar__step.is-current {
  background: color-mix(in srgb, var(--fcc-primary-900) 20%, transparent);
}

.commission-wizard-sidebar__step.is-complete:not(.is-current) {
  border-color: color-mix(in srgb, var(--color-success) 30%, var(--fcc-border));
}

.commission-wizard-sidebar__step.is-error {
  border-color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 5%, var(--fcc-surface));
}

.commission-wizard-sidebar__step.is-locked {
  cursor: not-allowed;
  opacity: 0.5;
}

.commission-wizard-sidebar__index {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border-radius: var(--fcc-radius-pill);
  background: var(--fcc-surface-elevated);
  border: 1px solid var(--fcc-border);
  color: var(--fcc-text);
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.commission-wizard-sidebar__step.is-current .commission-wizard-sidebar__index {
  background: var(--fcc-primary-600);
  border-color: var(--fcc-primary-600);
  color: white;
}

.commission-wizard-sidebar__step.is-complete .commission-wizard-sidebar__index {
  background: var(--color-success);
  border-color: var(--color-success);
  color: white;
}

.commission-wizard-sidebar__step.is-error .commission-wizard-sidebar__index {
  background: var(--color-danger);
  border-color: var(--color-danger);
  color: white;
}

.commission-wizard-sidebar__copy {
  display: grid;
  gap: 0.1rem;
}

.commission-wizard-sidebar__copy strong {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--fcc-text);
}

.commission-wizard-sidebar__copy small {
  color: var(--fcc-text-muted);
  font-size: 0.72rem;
}

.commission-wizard-sidebar__mobile {
  display: block;
  margin-bottom: 1rem;
}

.commission-wizard-sidebar__mobile-scroll {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(160px, 1fr);
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.commission-wizard-sidebar__mobile-step {
  display: grid;
  gap: 0.2rem;
  padding: 0.85rem 1rem;
  border-radius: var(--fcc-radius-lg);
  border: 1px solid var(--fcc-border);
  background: var(--fcc-surface);
  text-align: left;
}

.commission-wizard-sidebar__mobile-step span {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--fcc-primary-600);
}

.commission-wizard-sidebar__mobile-step strong {
  font-size: 0.88rem;
  line-height: 1.3;
  color: var(--fcc-text);
}

.commission-wizard-sidebar__mobile-step.is-current {
  border-color: var(--fcc-primary-500);
  background: var(--fcc-primary-50);
}

.commission-wizard-sidebar__mobile-step.is-complete {
  border-color: var(--color-success);
}

.commission-wizard-sidebar__mobile-step.is-error {
  border-color: var(--color-danger);
}

@media (min-width: 1024px) {
  .commission-wizard-sidebar__desktop {
    display: block;
  }

  .commission-wizard-sidebar__mobile {
    display: none;
  }
}
</style>
