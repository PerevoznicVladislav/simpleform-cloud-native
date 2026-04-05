# Simple Fullstack App

Aplicatie fullstack simpla, pregatita pentru laboratoarele de Cloud Native, cu containere separate pentru:

- frontend (`React + TypeScript + Nginx`)
- backend (`ASP.NET Core Web API`)
- baza de date (`MongoDB`)

## Analiza pe laboratoare

Pe baza cerintelor extrase din `Lucrari practice.pdf` si din raportul primit, proiectul se afla acum in etapa:

- Laboratorul 1: realizat in varianta simplificata, fara Clean Architecture completa.
- Laboratorul 2: realizat prin `Dockerfile` pentru frontend/backend si `docker-compose.yml`.
- Laboratorul 3: realizat local in Rancher Desktop, cu `Namespace`, `ConfigMap`, `Deployment`, `Service` si `PVC`.
- Laboratorul 4: pregatit pentru directia Cloud Run prin workflow GitHub Actions si imagini in Artifact Registry.

## Arhitectura

Flux:

1. Utilizatorul completeaza formularul cu `nume` si `prenume` in frontend.
2. Frontend-ul trimite un request `POST /api/submissions` catre backend.
3. Backend-ul valideaza datele, salveaza documentul in MongoDB si returneaza un mesaj.
4. Frontend-ul afiseaza mesajul intr-un popup.
5. In Cloud Run, frontend-ul primeste la runtime URL-ul backend-ului prin `env-config.js` generat la pornirea containerului.

## Structura proiectului

```text
backend/
frontend/
k8s/
.github/workflows/
docker-compose.yml
README.md
```

## Rulare locala

### Cu Docker Compose

```bash
docker compose up --build
```

Aplicatia va fi disponibila la:

- frontend: `http://localhost:3000`
- backend: `http://localhost:8080`
- MongoDB: `mongodb://localhost:27017`

### Fara Docker

Backend:

```bash
cd backend/SimpleForm.Api
dotnet restore
dotnet run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

In development, Vite face proxy pentru `/api` catre `http://localhost:8080`.

## Laboratorul 3: Kubernetes

Directorul `k8s/` contine:

- `namespace.yaml`
- `configmap.yaml`
- `mongo.yaml`
- `backend.yaml`
- `frontend.yaml`
- `kustomization.yaml`

### Deploy in Rancher Desktop / Kubernetes local

```bash
kubectl apply -k k8s
kubectl get pods -n simpleform
kubectl get svc -n simpleform
```

Daca serviciul `frontend` nu primeste IP extern local, il poti expune cu:

```bash
kubectl port-forward svc/frontend 3000:80 -n simpleform
```

Verificare backend:

```bash
kubectl port-forward svc/backend 8080:8080 -n simpleform
curl http://localhost:8080/health
curl http://localhost:8080/api/submissions
```

## Laboratorul 4: CI/CD pe Google Cloud Run

Workflow-ul `.github/workflows/deploy-cloudrun.yml` face urmatoarele:

1. autentificare in Google Cloud prin cheia de service account;
2. build si push pentru imaginile frontend/backend in Artifact Registry;
3. deploy backend pe Cloud Run cu variabile de mediu pentru MongoDB si CORS;
4. deploy frontend pe Cloud Run cu `API_BASE_URL` injectat la runtime;
5. afisarea URL-urilor finale pentru backend si frontend.

### Secret-e necesare in GitHub

- `GCP_PROJECT`
- `GCP_REGION`
- `GCP_SA_KEY`
- `MONGO_CONNECTION_STRING`
- `ALLOWED_ORIGINS`

### Resurse Google Cloud recomandate

- Artifact Registry repository: `simpleform`
- Cloud Run service backend: `simpleform-backend`
- Cloud Run service frontend: `simpleform-frontend`
- regiune: `europe-west1` sau orice alta regiune aleasa de tine

### Observatii pentru primul deploy

- backend-ul poate functiona si fara `ALLOWED_ORIGINS` setat, caz in care permite orice origine;
- dupa primul deploy al frontend-ului, poti seta `ALLOWED_ORIGINS` la URL-ul real al frontend-ului din Cloud Run pentru o configurare mai stricta.

## Observatii de verificare

In mediul curent de lucru, deploy-ul real spre Google Cloud nu a fost rulat inca. Au fost pregatite codul frontend, backend-ul si workflow-ul astfel incat proiectul sa poata fi mutat din directia GKE in directia Cloud Run, conform raportului.
