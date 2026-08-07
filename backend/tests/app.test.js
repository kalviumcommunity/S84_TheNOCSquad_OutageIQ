import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

describe('OutageIQ Backend API Tests', () => {
  it('GET /api/health returns 200 and health info', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.service, 'outageiq-backend');
    assert.equal(res.body.product, 'OutageIQ');
    assert.equal(res.body.team, 'The NOC Squad');
  });

  it('POST /api/login succeeds with valid demo credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'rahul', password: 'outageiq-demo' });

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.user.displayName, 'Rahul K.');
    assert.equal(res.body.user.role, 'NOC Engineer');
    assert.ok(res.body.token.includes('rahul'));
  });

  it('POST /api/login fails with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'wrong', password: 'wrongpassword' });

    assert.equal(res.status, 401);
    assert.equal(res.body.ok, false);
    assert.equal(res.body.message, 'Invalid demo credentials');
  });

  it('GET /api/overview returns 200 and overview dashboard metrics', async () => {
    const res = await request(app).get('/api/overview');
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.ok(res.body.summary);
    assert.ok(Array.isArray(res.body.outages));
    assert.ok(res.body.outages.length > 0);
    assert.ok(res.body.weeklySummary);
  });

  it('GET /api/outages returns list of outages', async () => {
    const res = await request(app).get('/api/outages');
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.ok(Array.isArray(res.body.outages));
    assert.ok(res.body.outages.length >= 5);
  });

  it('GET /api/regions returns list of regions', async () => {
    const res = await request(app).get('/api/regions');
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.ok(Array.isArray(res.body.regions));
    assert.ok(res.body.regions.length >= 5);
  });

  it('GET /api/analytics returns analytics trend and complaints data', async () => {
    const res = await request(app).get('/api/analytics');
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.ok(res.body.analytics);
    assert.ok(Array.isArray(res.body.analytics.trend));
  });

  it('GET /api/export returns top prioritized outages for executive export', async () => {
    const res = await request(app).get('/api/export');
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.reportTitle, 'Executive OutageIQ Export');
    assert.ok(Array.isArray(res.body.prioritizedOutages));
    assert.equal(res.body.prioritizedOutages.length, 5);
  });
});
