---
description: Create a new feature module with standard structure
---

# Create New Feature Module

When creating a new feature in Arumanis, follow this workflow:

## 1. Create Feature Directory Structure

Create the following directory structure in `src/features/[feature-name]/`:

```
src/features/[feature-name]/
├── api/
│   └── [feature-name].ts
├── components/
│   ├── [Feature]List.tsx
│   ├── [Feature]Form.tsx
│   └── [Feature]Detail.tsx
├── types/
│   └── index.ts
└── index.ts
```

## 2. Define Types (`types/index.ts`)

```typescript
export interface YourFeature {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateYourFeatureDto {
  name: string;
}

export interface UpdateYourFeatureDto {
  name?: string;
}
```

## 3. Create API Functions (`api/[feature-name].ts`)

```typescript
import api from '@/lib/api-client';
import type { YourFeature, CreateYourFeatureDto, UpdateYourFeatureDto } from '../types';

interface PaginatedResponse<T> {
  data: T[];
  meta: { current_page: number; last_page: number; total: number };
}

export async function getYourFeatures(params?: { page?: number; search?: string }) {
  return api.get<PaginatedResponse<YourFeature>>('/your-features', { params });
}

export async function getYourFeatureById(id: number) {
  return api.get<{ data: YourFeature }>(`/your-features/${id}`);
}

export async function createYourFeature(data: CreateYourFeatureDto) {
  return api.post<{ data: YourFeature }>('/your-features', data);
}

export async function updateYourFeature(id: number, data: UpdateYourFeatureDto) {
  return api.put<{ data: YourFeature }>(`/your-features/${id}`, data);
}

export async function deleteYourFeature(id: number) {
  return api.delete(`/your-features/${id}`);
}
```

## 4. Create Components

### List Component (`components/[Feature]List.tsx`)

```typescript
import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { toast } from 'sonner';
import { getYourFeatures, deleteYourFeature } from '../api/your-feature';
import type { YourFeature } from '../types';

export default function YourFeatureList() {
  const [data, setData] = useState<YourFeature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getYourFeatures();
      setData(response.data);
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus?')) return;
    try {
      await deleteYourFeature(id);
      toast.success('Data berhasil dihapus');
      fetchData();
    } catch (error) {
      toast.error('Gagal menghapus data');
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Your Feature</h1>
          <Button asChild>
            <Link to="/your-feature/new">
              <Plus className="mr-2 h-4 w-4" />
              Tambah
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            {loading ? (
              <p>Memuat...</p>
            ) : (
              <ul className="space-y-2">
                {data.map((item) => (
                  <li key={item.id} className="flex justify-between items-center p-2 border rounded">
                    <span>{item.name}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/your-feature/${item.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
```

## 5. Create Route Files

Create route files in `src/routes/[feature-name]/`:

- `index.tsx` - List page
- `new.tsx` - Create page
- `$id.tsx` - Detail page
- `$id.edit.tsx` - Edit page

## 6. Export from Feature Index (`index.ts`)

```typescript
export * from './types';
export * from './api/your-feature';
export { default as YourFeatureList } from './components/YourFeatureList';
export { default as YourFeatureForm } from './components/YourFeatureForm';
```

## Checklist

- [ ] Types defined
- [ ] API functions created
- [ ] List component created
- [ ] Form component created (create/edit)
- [ ] Route files added
- [ ] Feature exports configured
- [ ] Backend API endpoints ready (apiamis)
