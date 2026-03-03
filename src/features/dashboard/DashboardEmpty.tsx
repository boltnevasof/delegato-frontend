import { Link } from 'react-router-dom'
import { EmptyState, Button, RobotIcon } from '../../shared/ui'

export function DashboardEmpty() {
  return (
    <EmptyState
      icon={<RobotIcon size={96} />}
      title="У вас пока нет агентов"
      description="Создайте AI-ассистента, который завтра утром пришлёт вам план дня"
      action={
        <Link to="/pricing">
          <Button>Создать агента</Button>
        </Link>
      }
    />
  )
}
