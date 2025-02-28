import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongo from "@/libs/mongoose";
import Job from "@/models/Job";

export async function GET(req) {
  try {
    const session = await auth();
    
    await connectMongo();
    const jobs = await Job.find({ userId: session.user.id })
      .sort({ createdAt: -1 });

    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    const body = await req.json();
    
    await connectMongo();
    
    // Set default values for new job
    const jobData = {
      ...body,
      userId: session.user.id,
      applicationDate: body.status === 'Applied' ? new Date() : null
    };
    
    // If next action fields are provided, use them
    if (body.nextActionDate) {
      jobData.nextActionDate = new Date(body.nextActionDate);
    }
    
    const job = await Job.create(jobData);

    return NextResponse.json(job);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await auth();
    const body = await req.json();
    const { id, ...updates } = body;
    
    // Handle date conversion for applicationDate
    if (updates.applicationDate !== undefined) {
      if (updates.applicationDate) {
        updates.applicationDate = new Date(updates.applicationDate);
      } else {
        updates.applicationDate = null;
      }
    }
    
    // Handle date conversion for nextActionDate
    if (updates.nextActionDate !== undefined) {
      if (updates.nextActionDate) {
        updates.nextActionDate = new Date(updates.nextActionDate);
      } else {
        updates.nextActionDate = null;
      }
    }
    
    // If status is being changed to 'Applied' and there's no application date, set it
    if (updates.status === 'Applied' && updates.applicationDate === undefined) {
      const existingJob = await Job.findOne({ _id: id, userId: session.user.id });
      if (!existingJob.applicationDate) {
        updates.applicationDate = new Date();
      }
    }
    
    console.log("API received update:", id, updates);
    
    await connectMongo();
    const job = await Job.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      updates,
      { new: true }
    );

    return NextResponse.json(job);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    await connectMongo();
    await Job.findOneAndDelete({ _id: id, userId: session.user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}