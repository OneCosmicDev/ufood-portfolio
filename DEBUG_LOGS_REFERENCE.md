# Logs de débogage - Référence pour dépannage futur

## Problème résolu : Les visites ne se mettaient pas à jour

### Cause
L'API limite les résultats à 10 visites. Les nouvelles visites étaient créées mais n'apparaissaient pas dans les résultats GET.

### Solution
Mise à jour optimiste du cache : fusion des données de l'API avec les nouvelles visites créées localement.

---

## Logs utiles pour déboguer l'API des visites

### Dans RestaurantDetail.tsx - handleVisitSubmit

```javascript
// Logs de création
console.log('🔵 [DEBUG] Creating visit with payload:', visitPayload);
console.log('🟢 [DEBUG] Visit created successfully, response:', response);
console.log('🆕 [DEBUG] New visit ID from response:', newVisitId);

// Logs de fusion
console.log('📦 [DEBUG] Existing cached visits:', existingCachedVisits.length);
console.log('🔧 [DEBUG] Final merged visits array:', finalVisits.length, 'visits');
console.log('🔧 [DEBUG] Visit IDs in final array:', finalVisits.map((v: any) => v.id));
console.log('✅ [DEBUG] Cache updated with', finalVisits.length, 'visits');
```

### Dans visitService.ts

```javascript
console.log('📤 [DEBUG] POST request to:', url);
console.log('📤 [DEBUG] POST payload:', visitData);
console.log('✅ [DEBUG] POST response status:', response.status);
console.log('✅ [DEBUG] POST response data:', response.data);
```

### Dans UserProfile.tsx

```javascript
// Logs de chargement
console.log('🏁 [DEBUG UserProfile] componentDidMount - initial visits:', initialVisits);
console.log('🏁 [DEBUG UserProfile] initial visits count:', initialVisits.length);

// Logs de mise à jour
console.log('🔄 [DEBUG UserProfile] componentDidUpdate triggered');
console.log('📊 [DEBUG UserProfile] prevVisits count:', prevVisits.length);
console.log('📊 [DEBUG UserProfile] currentVisits count:', currentVisits.length);
console.log('🔍 [DEBUG UserProfile] Query state:', { ... });

// Logs de conversion
console.log('🍽️ [DEBUG UserProfile] convertVisitsToRestaurants called with', visits.length, 'visits');
console.log('📊 [DEBUG UserProfile] Visits grouped by restaurant:', visitsByRestaurant);
console.log('✅ [DEBUG UserProfile] Restaurant ${restaurantId} (${restaurant.name}) has ${visitCount} visits');
```

---

## Comment réactiver les logs

Si tu as besoin de déboguer à nouveau, cherche les sections marquées avec `// DEBUG:` et décommente les console.log.

