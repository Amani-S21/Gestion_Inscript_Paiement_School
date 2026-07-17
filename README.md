# GESTION_INSCRIPTION_PAIEMENT

Application web autonome pour la gestion des inscriptions et paiements de l'Institut NENGAPETA. 

## Structure

- `backend`: API FastAPI, SQLAlchemy, Alembic, JWT, RBAC.
- `frontend`: React, TypeScript, Vite, Tailwind CSS, React Query.

## Demarrage backend

```bash
cd backend
python -m venv .venv
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

## Demarrage frontend

```bash
cd frontend
npm install
npm run dev
```

Compte initial cree au demarrage si la base est vide:

- Login: `admin`
- Mot de passe: `admin123`

