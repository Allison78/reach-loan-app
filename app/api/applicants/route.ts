import { NextRequest, NextResponse } from 'next/server';

// GET /api/applicants - Fetch all applicants
export async function GET() {
  try {
    const edgeConfigId = process.env.EDGE_CONFIG_ID;
    const readToken = process.env.EDGE_CONFIG_READ_TOKEN;
    const itemKey = process.env.EDGE_CONFIG_ITEM_KEY;

    if (!edgeConfigId || !readToken || !itemKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://edge-config.vercel.com/${edgeConfigId}/item/${itemKey}?token=${readToken}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch applicants: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching applicants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applicants' },
      { status: 500 }
    );
  }
}

// POST /api/applicants - Submit new applicant
export async function POST(request: NextRequest) {
  try {
    const edgeConfigId = process.env.EDGE_CONFIG_ID;
    const apiToken = process.env.VERCEL_API_TOKEN;
    const itemKey = process.env.EDGE_CONFIG_ITEM_KEY;

    if (!edgeConfigId || !apiToken || !itemKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const newApplicant = await request.json();

    // First, get current applicants
    const readToken = process.env.EDGE_CONFIG_READ_TOKEN;
    const currentApplicantsResponse = await fetch(
      `https://edge-config.vercel.com/${edgeConfigId}/item/${itemKey}?token=${readToken}`
    );

    const currentApplicants = await currentApplicantsResponse.json() || [];

    // Update with new applicant
    const response = await fetch(
      `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              operation: 'update',
              key: itemKey,
              value: [...currentApplicants, newApplicant],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update applicants: ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json({ success: true, applicant: newApplicant });
  } catch (error) {
    console.error('Error submitting applicant:', error);
    return NextResponse.json(
      { error: 'Failed to submit applicant' },
      { status: 500 }
    );
  }
}
