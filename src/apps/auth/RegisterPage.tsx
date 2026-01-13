//
//  RegisterPage.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright 2026 Victor Sanchez. All rights reserved.
//

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { registerSchema, type RegisterInput } from '@shared/validations'
import { Button, Input } from '@shared/ui'
import { register, storeTokens } from '../../services/auth/authService'
import styles from './AuthPage.module.css'

export function RegisterPage() {
  const navigate = useNavigate()
  const [globalError, setGlobalError] = useState<string>()
  const [isFormValid, setIsFormValid] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedFields = watch()

  useEffect(() => {
    const isFirstNameValid = !!watchedFields.firstName && !errors.firstName
    const isLastNameValid = !!watchedFields.lastName && !errors.lastName
    const isEmailValid = !!watchedFields.email && !errors.email
    const isPasswordValid = !!watchedFields.password && !errors.password
    setIsFormValid(isFirstNameValid && isLastNameValid && isEmailValid && isPasswordValid)
  }, [watchedFields, errors])

  const onSubmit = async (data: RegisterInput) => {
    try {
      setGlobalError(undefined)
      const response = await register(data)
      storeTokens(response)
      navigate('/dashboard')
    } catch (err) {
      if (err instanceof Error && err.message === 'USER_EXISTS') {
        setGlobalError('El email ya está registrado')
      } else {
        setGlobalError('Ocurrió un error al registrarse')
      }
    }
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.title}>Crear cuenta</h2>
        <p className={styles.subtitle}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login">Inicia sesión</Link>
        </p>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          {globalError && (
            <div className={styles.errorBox}>
              <div className={styles.errorText}>{globalError}</div>
            </div>
          )}
          <div className={styles.formSpace}>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Nombre"
                  placeholder="Tu nombre"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.firstName?.message}
                  required
                />
              )}
            />
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Apellido"
                  placeholder="Tu apellido"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.lastName?.message}
                  required
                />
              )}
            />
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
                  placeholder="Mínimo 8 caracteres, una mayúscula y un número"
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
            disabled={isSubmitting}
            className={styles.submitButton}
            variant={isFormValid && !isSubmitting ? 'primary' : 'secondary'}
          >
            {isSubmitting ? 'Registrando...' : 'Registrarse'}
          </Button>
        </form>
      </div>
    </div>
  )
}
