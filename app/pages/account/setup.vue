<template>
  <div class="setup-account-container">
    <div class="setup-account">
      <h2 class="setup-account__title">
        Complete Your Account Setup
      </h2>
      <p class="setup-account__description">
        Please provide some information to complete your profile setup.
      </p>

      <div class="setup-account__content">
        <Form
          :error="form.formError.value"
          @submit="form.handleSubmit"
        >
          <!-- Basic Information -->
          <div class="form-section">
            <h3 class="form-section__title">
              Basic Information
            </h3>

            <FormInput
              id="name"
              v-model="nameField"
              label="Full Name"
              type="text"
              autocomplete="name"
              placeholder="Enter your full name"
              required
            />

            <FormTextarea
              id="bio"
              v-model="profileBioField"
              label="Bio (Optional)"
              placeholder="Tell us about yourself..."
              :rows="3"
            />
          </div>

          <!-- Membership Information -->
          <div class="form-section">
            <h3 class="form-section__title">
              Membership Information
            </h3>

            <FormSelect
              id="membershipType"
              v-model="membershipTypeField"
              label="Membership Type"
              placeholder="Select your membership type"
              placeholder-value="UNKNOWN"
              :options="membershipOptions"
              required
            />

            <!-- Student ID - only for non-guest members -->
            <FormInput
              v-if="showStudentId"
              id="studentId"
              v-model="studentIdField"
              label="Student ID"
              type="text"
              placeholder="Enter your student ID"
            />

            <!-- Course and Graduation Year - not required for guests -->
            <FormInput
              v-if="showCourseAndGradYear"
              id="course"
              v-model="profileCourseField"
              label="Course/Degree (Optional)"
              type="text"
              placeholder="e.g. Computer Science"
            />

            <FormInput
              v-if="showCourseAndGradYear"
              id="gradYear"
              v-model="profileGradYearField"
              :label="gradYearLabel"
              type="number"
              :placeholder="gradYearPlaceholder"
              :min="gradYearMin"
              :max="gradYearMax"
            />
          </div>

          <!-- Social Links -->
          <UIExpandableSection
            title="Social Links (Optional)"
            description="Add your social media profiles to connect with other members."
          >
            <FormInput
              id="facebook"
              v-model="socialFacebookField"
              label="Facebook"
              type="url"
              placeholder="https://facebook.com/username"
            />

            <FormInput
              id="instagram"
              v-model="socialInstagramField"
              label="Instagram Handle"
              type="text"
              placeholder="@username"
            />

            <FormInput
              id="linkedin"
              v-model="socialLinkedinField"
              label="LinkedIn"
              type="url"
              placeholder="https://linkedin.com/in/username"
            />

            <FormInput
              id="github"
              v-model="socialGithubField"
              label="GitHub"
              type="url"
              placeholder="https://github.com/username"
            />

            <FormInput
              id="discord"
              v-model="socialDiscordField"
              label="Discord Username"
              type="text"
              placeholder="@username"
            />
          </UIExpandableSection>

          <FormButton
            type="submit"
            :disabled="form.isSubmitting.value || !form.isValid.value"
          >
            {{ form.isSubmitting.value ? 'Completing Setup...' : 'Complete Setup' }}
          </FormButton>
        </Form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { userUpdateSchema } from '~~/shared/schemas/user'

definePageMeta({
  middleware: ['auth', () => {
    const { user } = useUserSession()

    if (!user.value) {
      return navigateTo('/login')
    }

    // Ensure email is verified
    if (!user.value.emailVerified) {
      return navigateTo('/verify-email')
    }

    // If user has already completed setup, redirect to profile
    if (user.value.setupCompleted) {
      return navigateTo('/account')
    }
  }],
  layout: 'default',
})

// Current year for validation
const currentYear = new Date().getFullYear()

// Load existing user data
const { data: userData } = await useFetch('/api/account')

// Membership options
const membershipOptions = [
  { label: 'Full Member', value: 'FULL' },
  { label: 'Associate Member', value: 'ASSOCIATE' },
  { label: 'Fellow', value: 'FELLOW' },
  { label: 'Alumni', value: 'ALUMNI' },
  { label: 'Guest', value: 'GUEST' },
]

const form = useForm({
  schema: userUpdateSchema,
  initialValues: userData.value?.data?.user || {},
  onSubmit: async (_values, changedValues) => {
    try {
      await $fetch('/api/users/me?setup=true', {
        method: 'PATCH',
        body: changedValues,
      })

      // Refresh auth state and redirect
      const { refresh } = useAuth()
      await refresh()

      await navigateTo('/')
    }
    catch (error: unknown) {
      console.error('Setup submission error:', error)
      const errorData = error as { data?: { message?: string } }
      form.setFormError(errorData?.data?.message || 'Setup failed. Please try again.')
    }
  },
})

// Register form fields using reactiveField
const nameField = form.reactiveField('name')
const studentIdField = form.reactiveField('studentId')
const membershipTypeField = form.reactiveField('membership.type')
const _membershipExpiryField = form.reactiveField<Date | null>('membership.expiry', null)
const _profileNameField = form.reactiveField('profile.name')
const profileBioField = form.reactiveField('profile.bio')
const _profileAvatarField = form.reactiveField('profile.avatar')
const profileGradYearField = form.reactiveField('profile.gradYear')
const profileCourseField = form.reactiveField('profile.course')
const socialGithubField = form.reactiveField('profile.socialLinks.github')
const socialLinkedinField = form.reactiveField('profile.socialLinks.linkedin')
const socialFacebookField = form.reactiveField('profile.socialLinks.facebook')
const socialDiscordField = form.reactiveField('profile.socialLinks.discord')
const socialInstagramField = form.reactiveField('profile.socialLinks.instagram')

// Computed properties for conditional rendering and validation
const showStudentId = computed(() => {
  const membershipTypeValue = membershipTypeField.value.value
  return membershipTypeValue && membershipTypeValue !== 'GUEST' && membershipTypeValue !== 'UNKNOWN'
})

const showCourseAndGradYear = computed(() => {
  const membershipTypeValue = membershipTypeField.value.value
  return membershipTypeValue && membershipTypeValue !== 'GUEST' && membershipTypeValue !== 'UNKNOWN'
})

const gradYearLabel = computed(() => {
  const membershipTypeValue = membershipTypeField.value.value
  switch (membershipTypeValue) {
    case 'ALUMNI':
      return 'Graduation Year'
    case 'FULL':
    case 'ASSOCIATE':
    case 'FELLOW':
      return 'Expected Graduation Year (Optional)'
    default:
      return 'Graduation Year (Optional)'
  }
})

const gradYearPlaceholder = computed(() => {
  const membershipTypeValue = membershipTypeField.value.value
  switch (membershipTypeValue) {
    case 'ALUMNI':
    case 'FELLOW':
      return 'e.g. 2020'
    case 'FULL':
    case 'ASSOCIATE':
      return `e.g. ${currentYear + 2}`
    default:
      return `e.g. ${currentYear}`
  }
})

const gradYearMin = computed(() => 1900)
const gradYearMax = computed(() => {
  const membershipTypeValue = membershipTypeField.value.value
  if (membershipTypeValue === 'ALUMNI') return currentYear
  return currentYear + 5
})
</script>

<style scoped>
.setup-account-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 2rem 1rem;
  background: var(--primary-bg-color);
}

.setup-account {
  max-width: 700px;
  width: 100%;
  background: var(--secondary-bg-color);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 2px solid var(--nnt-orange);
  padding: 2.5rem;
  margin-top: 2rem;
}

.setup-account__title {
  text-align: center;
  margin-bottom: 0.5rem;
  color: var(--primary-text-color);
  font-size: 2rem;
  font-weight: 600;
}

.setup-account__description {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--secondary-text-color);
  font-size: 1.1rem;
}

.setup-account__content {
  margin-top: 1.5rem;
}

.form-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--header-bg-color);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.form-section__title {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary-text-color);
}

.form-section__description {
  margin: 0 0 1.5rem 0;
  font-size: 0.9rem;
  color: var(--secondary-text-color);
}

/* Remove background from first section to match the design */
.form-section:first-child {
  background: transparent;
  border: none;
  padding: 0;
  margin-bottom: 1.5rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .setup-account-container {
    padding: 1rem;
  }

  .setup-account {
    padding: 1.5rem;
    margin-top: 1rem;
  }

  .setup-account__title {
    font-size: 1.5rem;
  }

  .form-section {
    padding: 1rem;
  }
}
</style>
