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
    const job = await Job.create({
      ...body,
      userId: session.user.id,
      applicationDate: body.status === 'Applied' ? new Date() : null
    });

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
    
    await connectMongo();
    const job = await Job.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      updates,
      { new: true }
    );

    return NextResponse.json(job);
  } catch (error) {
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