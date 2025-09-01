<template>
  <div class="edit-actions">
    <div class="edit-buttons">
      <NuxtLink
        :to="editUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="edit-btn edit-direct"
        aria-label="Edit this page"
      >
        <UIButton
          variant="primary"
          class="edit-btn-inner"
        >
          <Icon
            name="icon:edit"
            class="edit-icon"
          />
          Edit this page
        </UIButton>
      </NuxtLink>
      <NuxtLink
        :to="suggestUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="edit-btn edit-suggest"
        aria-label="Suggest an edit"
      >
        <UIButton
          variant="ghost"
          class="edit-btn-inner"
        >
          <Icon
            name="icon:suggest"
            class="edit-icon"
          />
          Suggest an edit
        </UIButton>
      </NuxtLink>
    </div>

    <p class="edit-help">
      Help improve this wiki by editing directly or suggesting changes. All contributions are welcome!
    </p>
  </div>
</template>

<script setup lang="ts">
import UIButton from '~/components/ui/UIButton.vue'

interface Props {
  currentPath: string
  githubRepo?: string
  githubBranch?: string
}

const props = withDefaults(defineProps<Props>(), {
  githubRepo: 'newtheatre/proscenium', // TODO: Update when moved to newtheatre/website (if we end up doing this)
  githubBranch: 'main',
})

// Generate GitHub URLs for editing
const editUrl = computed(() => {
  const filePath = `content${props.currentPath}.md`
  return `https://github.com/${props.githubRepo}/edit/${props.githubBranch}/${filePath}`
})

const suggestUrl = computed(() => {
  const title = encodeURIComponent(`Improve wiki page: ${props.currentPath}`)
  const body = encodeURIComponent(`I'd like to suggest improvements to the wiki page at ${props.currentPath}.

**What changes would you like to see?**


**Additional context**


<!-- Please describe your suggested changes above -->`)

  return `https://github.com/${props.githubRepo}/issues/new?title=${title}&body=${body}&labels=wiki,enhancement`
})
</script>

<style scoped>
.edit-actions {
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
  background-color: var(--secondary-bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
}

.edit-buttons {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.edit-btn {
  display: inline-block;
  text-decoration: none;
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
}

.edit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.edit-btn-inner {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  width: 100%;
  border: none;
  cursor: pointer;
}

.edit-direct .edit-btn-inner {
  background-color: var(--nnt-purple);
  color: var(--primary-text-color);
}

.edit-direct:hover .edit-btn-inner {
  background-color: var(--nnt-purple-light);
}

.edit-suggest .edit-btn-inner {
  background-color: transparent;
  color: var(--nnt-orange);
  border: 1px solid var(--nnt-orange);
}

.edit-suggest:hover .edit-btn-inner {
  background-color: var(--nnt-orange);
  color: var(--primary-bg-color);
}

.edit-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.edit-help {
  margin: 0;
  font-size: 0.75rem;
  color: var(--secondary-text-color);
  line-height: 1.4;
}

@media (max-width: 640px) {
  .edit-buttons {
    flex-direction: column;
  }

  .edit-btn {
    width: 100%;
  }

  .edit-btn-inner {
    justify-content: center;
  }
}
</style>
