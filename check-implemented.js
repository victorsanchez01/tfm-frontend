// Script para verificar implementación de historias de usuario
const fs = require('fs');
const path = require('path');

// Lista de historias a verificar
const userStories = [
  { id: 'US-001', name: 'Registro de Usuario', keywords: ['register', 'registro', 'signup'] },
  { id: 'US-002', name: 'Consultar Perfil', keywords: ['profile', 'perfil', 'ProfilePage'] },
  { id: 'US-003', name: 'Actualizar Perfil', keywords: ['profile', 'perfil', 'edit', 'update'] },
  { id: 'US-004', name: 'Crear Objetivo', keywords: ['goals', 'objetivos', 'goal', 'create'] },
  { id: 'US-005', name: 'Actualizar Objetivo', keywords: ['goals', 'objetivos', 'edit', 'update', 'pause'] },
  { id: 'US-010', name: 'Listar Dominios', keywords: ['domains', 'dominios', 'DomainPage'] },
  { id: 'US-011', name: 'Crear Dominio', keywords: ['createDomain', 'crear dominio'] },
  { id: 'US-012', name: 'Listar Skills', keywords: ['skills', 'habilidades', 'SkillPage'] },
  { id: 'US-013', name: 'Gestionar Prerrequisitos', keywords: ['prerequisites', 'prerrequisitos'] },
  { id: 'US-014', name: 'Listar Contenidos', keywords: ['contents', 'contenidos', 'ContentsPage'] },
  { id: 'US-015', name: 'Crear/Editar Contenido', keywords: ['createContent', 'editContent'] },
  { id: 'US-016', name: 'Sistema de Favoritos', keywords: ['favorites', 'favoritos', 'FavoritesPage', 'bookmark'] },
  { id: 'US-020', name: 'Generar Plan Inicial', keywords: ['plan', 'planning', 'generatePlan'] },
  { id: 'US-021', name: 'Replanificación Adaptativa', keywords: ['replan', 'replanning'] },
  { id: 'US-022', name: 'Ver Módulos del Plan', keywords: ['modules', 'módulos', 'PlanPage'] },
  { id: 'US-023', name: 'Actualizar Actividad', keywords: ['activity', 'actividad', 'updateActivity'] },
  { id: 'US-030', name: 'Crear Sesión de Evaluación', keywords: ['quiz', 'evaluation', 'QuizPlayer', 'assessment'] },
  { id: 'US-031', name: 'Obtener Siguiente Ítem', keywords: ['nextItem', 'adaptive', 'next'] },
  { id: 'US-032', name: 'Enviar Respuesta', keywords: ['answer', 'respuesta', 'submit'] },
  { id: 'US-033', name: 'Feedback Personalizado', keywords: ['feedback', 'retroalimentación'] },
  { id: 'US-034', name: 'Consultar Dominio', keywords: ['mastery', 'dominio', 'nivel'] },
  { id: 'US-040', name: 'Registrar Evento', keywords: ['events', 'tracking', 'analytics'] },
  { id: 'US-041', name: 'Consultar Eventos', keywords: ['events', 'analytics', 'reports'] }
];

console.log('Verificación de historias de usuario implementadas:\n');

userStories.forEach(story => {
  console.log(`\n${story.id}: ${story.name}`);
  console.log('----------------------------------------');
  
  let found = [];
  let implemented = false;
  
  // Buscar en src/
  story.keywords.forEach(keyword => {
    try {
      const { execSync } = require('child_process');
      const result = execSync(`grep -r "${keyword}" src/ --include="*.ts" --include="*.tsx" | head -5`, { encoding: 'utf8' });
      if (result) {
        found.push(`✓ ${keyword}: encontrado`);
        implemented = true;
      }
    } catch (e) {
      found.push(`✗ ${keyword}: no encontrado`);
    }
  });
  
  // Verificar si hay página específica
  const pageName = story.name.replace(/\s+/g, '');
  const possibleFiles = [
    `src/apps/${pageName.toLowerCase()}`,
    `src/apps/${pageName.toLowerCase()}s`,
    `src/components/${pageName.toLowerCase()}`
  ];
  
  let hasPage = false;
  possibleFiles.forEach(file => {
    if (fs.existsSync(file)) {
      found.push(`✓ Página encontrada: ${file}`);
      hasPage = true;
      implemented = true;
    }
  });
  
  console.log(found.join('\n'));
  console.log(`\nEstado: ${implemented ? '✅ IMPLEMENTADO' : '❌ NO IMPLEMENTADO'}`);
});

console.log('\n\n=== RESUMEN ===');
console.log('Revisar manualmente las historias marcadas como implementadas');
console.log('para verificar que cumplen con todos los criterios de aceptación.');
