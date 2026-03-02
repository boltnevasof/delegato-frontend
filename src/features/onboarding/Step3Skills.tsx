import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCatalog } from '../../api/skills'
import { onboardingSelectSkills } from '../../api/agents'
import { useApiError } from '../../shared/hooks/useApiError'
import { Button, Badge, ErrorBanner, Spinner } from '../../shared/ui'
import { OnboardingLayout } from './OnboardingLayout'

export function Step3Skills() {
  const navigate = useNavigate()
  const { error, setError, clearError } = useApiError()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['skillCatalog'],
    queryFn: getCatalog,
  })

  function toggleSkill(skillId: string) {
    setSelectedPreset(null)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(skillId)) next.delete(skillId)
      else next.add(skillId)
      return next
    })
  }

  function selectPreset(slug: string, skillIds: string[]) {
    setSelectedPreset(slug)
    setSelected(new Set(skillIds))
  }

  async function handleNext() {
    clearError()
    setSubmitting(true)
    try {
      await onboardingSelectSkills(
        selectedPreset ? undefined : Array.from(selected),
        selectedPreset ?? undefined,
      )
      navigate('/onboarding/4')
    } catch (err) {
      setError(err)
      setSubmitting(false)
    }
  }

  return (
    <OnboardingLayout step={3}>
      <h2>Выберите навыки</h2>
      <p className="hint">Какие задачи должен выполнять ваш ассистент?</p>

      {error && <ErrorBanner message={error.message} />}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <Spinner />
        </div>
      ) : (
        <>
          {data?.presets && data.presets.length > 0 && (
            <div className="preset-list mb-16">
              <p className="text-small text-muted">Быстрый выбор:</p>
              <div className="preset-buttons">
                {data.presets.map((preset) => (
                  <button
                    key={preset.slug}
                    type="button"
                    className={`btn btn--small ${selectedPreset === preset.slug ? 'btn--primary' : 'btn--secondary'}`}
                    onClick={() => selectPreset(preset.slug, preset.skill_ids)}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="skill-grid">
            {data?.skills.map((skill) => {
              const isSelected = selected.has(skill.id)
              return (
                <div
                  key={skill.id}
                  className={`skill-card ${isSelected ? 'selected' : ''} ${!skill.available_for_user ? 'disabled' : ''}`}
                  onClick={() => skill.available_for_user && toggleSkill(skill.id)}
                  style={{ cursor: skill.available_for_user ? 'pointer' : 'default' }}
                >
                  <div className="skill-card__header">
                    <label className="flex-center" style={{ gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!skill.available_for_user}
                        onChange={() => toggleSkill(skill.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <strong>{skill.name}</strong>
                    </label>
                    {!skill.available_for_user && (
                      <Badge variant="plan">{skill.access_level}</Badge>
                    )}
                  </div>
                  <p className="text-small text-muted">{skill.description}</p>
                </div>
              )
            })}
          </div>
        </>
      )}

      <div className="form-actions flex-between mt-16">
        <button
          type="button"
          className="btn btn--link"
          onClick={() => navigate('/onboarding/2')}
        >
          &larr; Назад
        </button>
        <Button loading={submitting} disabled={submitting} onClick={handleNext}>
          Далее &rarr;
        </Button>
      </div>
    </OnboardingLayout>
  )
}
