# TaskFlow — Backend

API REST con Node.js, Express, JWT y MySQL. Gestiona autenticación, perfil y tareas
asociadas a cada usuario. Este repositorio se despliega de manera independiente.

## Arquitectura desplegada

Frontend en Amplify → API Gateway HTTPS → Elastic Beanstalk → MySQL en RDS.
Actualizaciones: GitHub, rama `main` → CodePipeline Source → Deploy en Beanstalk.

- Frontend: https://alvarohj.tech
- API: https://api.alvarohj.tech/api
- Health check: https://api.alvarohj.tech/api/health

API Gateway entrega HTTPS con el certificado de ACM y reenvía las solicitudes al
entorno de Elastic Beanstalk. CORS permite los orígenes del frontend con y sin
`www`.

## Desarrollo local

Se necesita una instancia MySQL accesible. Al arrancar, el backend crea la base
indicada por `DB_NAME` si todavía no existe y después crea sus tablas.

```bash
# Instala las versiones fijadas en package-lock.json.
npm ci
# Crea la configuración local; ejecutar solo si todavía no existe .env.
cp .env.example .env
# Inicia Node con reinicio automático ante cambios de código.
npm run dev
```

Completa las variables de `.env` usando la plantilla comentada `.env.example`.
Para ejecutar sin el modo de desarrollo se utiliza `npm start`.

En Docker Compose, el backend conecta a MySQL mediante `db:3306`. Ese nombre
pertenece a la red interna de Docker y no se resuelve desde un proceso Node en el
equipo anfitrión. El Compose común no publica el puerto de MySQL.

## Organización del código

Rutas → middleware de autenticación → controladores → servicios → modelos → MySQL.

- `routes/`: define los endpoints y su protección.
- `controllers/`: transforma solicitudes y resultados en respuestas HTTP.
- `services/`: valida datos y aplica las reglas de negocio.
- `models/`: ejecuta SQL parametrizado y limita las tareas al usuario autenticado.
- `database/`: pool de conexiones, creación de tablas y datos iniciales.

## Endpoints

| Método y ruta | Propósito |
| --- | --- |
| `POST /api/auth/login` | Iniciar sesión y obtener un JWT |
| `GET /api/auth/me` | Recuperar el usuario autenticado |
| `GET /api/profile` | Consultar el perfil |
| `PUT /api/profile` | Actualizar nombre y correo |
| `GET /api/tasks` | Consultar tareas y resumen |
| `POST /api/tasks` | Crear una tarea |
| `PUT /api/tasks/:id` | Editar una tarea o su estado |
| `DELETE /api/tasks/:id` | Eliminar una tarea |
| `GET /api/health` | Comprobar que Express responde |
| `GET /api/health/database` | Comprobar conexión con MySQL |

Las rutas de perfil, tareas y `/auth/me` requieren `Authorization: Bearer <token>`.
El health check del proceso puede responder correctamente aunque MySQL no esté
disponible. El de base de datos comprueba conectividad, no la existencia de tablas.

## Configuración y datos iniciales

En Beanstalk, las variables se configuran en el entorno; `.env` no se publica.
Usar un `JWT_SECRET` propio y credenciales de base de datos del entorno.

Las variables `TASKFLOW_ADMIN_*` se aplican únicamente al crear el usuario inicial
cuando la tabla `users` está vacía. Cambiarlas después no actualiza ese usuario.
El usuario de `DB_USER` necesita inicialmente permiso `CREATE` porque una instancia
RDS puede haberse creado con `DBName` vacío. `CREATE DATABASE IF NOT EXISTS` conserva
la información en reinicios y despliegues posteriores. El nombre se valida antes
de interpolarlo porque los identificadores SQL no admiten parámetros `?`.

## Preparación para Elastic Beanstalk

`Procfile` declara `web: npm start`: `web` identifica el proceso HTTP y
`npm start` ejecuta `src/server.js`. El archivo no admite comentarios en la misma
línea, por eso se documenta aquí.

`.ebignore` excluye dependencias, Git, Docker y archivos `.env` del paquete que
Elastic Beanstalk recibe. Se conserva `.env.example` porque solo contiene nombres
y ejemplos de configuración.

`.ebextensions/healthcheck.config` configura `/api/health` como comprobación HTTP.
Ese endpoint confirma que Express responde y permite diagnosticar la conexión con
RDS por separado mediante `/api/health/database`.

## Verificación local realizada

Login, sesión, consulta y actualización de perfil, creación, edición, consulta y
eliminación de una tarea temporal. La tarea sobrevivió al reinicio de MySQL y del
backend; se eliminó al terminar la prueba. Persistencia local mediante `db_data`.

En AWS se verificaron login, perfil, creación, edición y cambio de estado de tareas.
Los datos permanecieron en RDS después de recargar el frontend.

CodePipeline quedó conectado al repositorio mediante GitHub App. Un `push` a
`main` inicia automáticamente las etapas `Source` y `Deploy`; Elastic Beanstalk
recibe `SourceArtifact` directamente, sin una etapa CodeBuild.
