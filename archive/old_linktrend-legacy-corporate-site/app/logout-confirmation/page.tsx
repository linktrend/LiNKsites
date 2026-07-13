import Link from 'next/link'

import { logout } from '@/app/actions/auth'
import { LegalPageLayout } from '@/components/layouts/LegalPageLayout'
import { Button } from '@/components/ui/button'
import { LogOut, X } from 'lucide-react'

interface LogoutConfirmationPageProps {
  params: { locale?: string }
}

export default function LogoutConfirmationPage({ params }: LogoutConfirmationPageProps) {
  const locale = params?.locale ?? 'en'

  return (
    <LegalPageLayout
      title="Log Out"
      subtitle="Are you sure you want to log out?"
    >
      <div className="text-center py-12 max-w-md mx-auto space-y-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <LogOut className="w-10 h-10 text-primary" />
        </div>
        <p className="text-lg text-muted-foreground">
          You are about to log out of your account. You will need to log in again to access your dashboard and account features.
        </p>
        <p className="text-sm text-muted-foreground">
          Your data and settings will be saved and available when you log back in.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <form action={logout} className="w-full sm:w-auto">
            <input type="hidden" name="locale" value={locale} />
            <Button type="submit" size="lg" variant="destructive" className="w-full">
              <LogOut className="mr-2 h-5 w-5" />
              Log Out
            </Button>
          </form>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href={`/${locale}`}>
              <X className="mr-2 h-5 w-5" />
              Cancel
            </Link>
          </Button>
        </div>

        <div className="pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            Need help?{' '}
            <Link href={`/${locale}/help-center`} className="text-primary hover:underline">
              Visit our Help Center
            </Link>
          </p>
        </div>
      </div>
    </LegalPageLayout>
  )
}
