//
//  LoginPage.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { loginSchema, type LoginInput } from '@shared/validations'
import { Button, Input } from '@shared/ui'
import { login, storeTokens } from '../../services/auth/authService'
import styles from './AuthPage.module.css'

export function LoginPage() {
  const navigate = useNavigate()
  const [globalError, setGlobalError] = useState<string>()
  const [isFormValid, setIsFormValid] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedFields = watch()

  useEffect(() => {
    const isEmailValid = !!watchedFields.email && !errors.email
    const isPasswordValid = !!watchedFields.password && !errors.password
    setIsFormValid(isEmailValid && isPasswordValid)
  }, [watchedFields, errors])

  const onSubmit = async (data: LoginInput) => {
    if (!isFormValid) return
    
    try {
      setGlobalError(undefined)
      const response = await login(data)
      storeTokens(response)
      navigate('/dashboard')
    } catch (err) {
      if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
        setGlobalError('Email o contraseña incorrectos')
      } else {
        setGlobalError('Ocurrió un error al iniciar sesión')
      }
    }
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.title}>Iniciar sesión</h2>
        <p className={styles.subtitle}>
          ¿No tienes cuenta?{' '}
          <Link to="/register">Regístrate</Link>
        </p>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          {globalError && (
            <div className={styles.errorBox}>
              <div className={styles.errorText}>{globalError}</div>
            </div>
          )}
          <div className={styles.formSpace}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  label="Email"
                  type="email"
                  placeholder="tu@email.com"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.email?.message}
                  required
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="Tu contraseña"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.password?.message}
                  required
                />
              )}
            />
          </div>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting || !isFormValid}
            className={styles.submitButton}
            variant={isFormValid ? 'primary' : 'secondary'}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>
      </div>
    </div>
  )
}
