import { NextResponse } from 'next/server';
import { getProjects } from '../../technical/utils/projectUtils';

export async function GET() {
  console.log("API route hit: /api/projects");
  try {
    const projects = await getProjects();
    // console.log("Projects fetched successfully:", projects);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error in API route:', error);
    // Log the full error stack trace
    console.error(error instanceof Error ? error.stack : String(error));
    return NextResponse.json({ error: 'Failed to fetch projects', details: String(error) }, { status: 500 });
  }
}