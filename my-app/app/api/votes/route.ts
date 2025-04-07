import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return '0.0.0.0';
}

export async function POST(request: NextRequest) {
  try {
    const { 
      projectId, 
      voterName, 
      planningScore, 
      technicalScore, 
      uiUxScore, 
      processScore, 
      aiUtilizationScore 
    } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { message: 'プロジェクトIDが必要です' },
        { status: 400 }
      );
    }

    const scores = [planningScore, technicalScore, uiUxScore, processScore, aiUtilizationScore];
    for (const score of scores) {
      if (typeof score !== 'number' || score < 0 || score > 5) {
        return NextResponse.json(
          { message: '評価は0から5の間である必要があります' },
          { status: 400 }
        );
      }
    }

    const votingPeriod = await prisma.votingPeriod.findFirst({
      where: { isActive: true },
    });

    if (!votingPeriod) {
      return NextResponse.json(
        { message: '現在投票期間ではありません' },
        { status: 403 }
      );
    }

    const now = new Date();
    if (now < votingPeriod.startTime || now > votingPeriod.endTime) {
      return NextResponse.json(
        { message: '現在投票期間ではありません' },
        { status: 403 }
      );
    }

    const ipAddress = getClientIp(request);
    
    const existingVote = await prisma.vote.findFirst({
      where: {
        ipAddress,
        projectId,
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { message: 'このプロジェクトにはすでに投票しています' },
        { status: 400 }
      );
    }

    const vote = await prisma.vote.create({
      data: {
        projectId,
        voterName: voterName || null,
        planningScore,
        technicalScore,
        uiUxScore,
        processScore,
        aiUtilizationScore,
        ipAddress,
      },
    });

    return NextResponse.json({ vote }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating vote:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: '投票の作成に失敗しました', error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { message: 'プロジェクトIDが必要です' },
        { status: 400 }
      );
    }

    const votingPeriod = await prisma.votingPeriod.findFirst({
      where: { isActive: true },
    });

    if (!votingPeriod) {
      return NextResponse.json(
        { message: '現在投票期間ではありません' },
        { status: 403 }
      );
    }

    const now = new Date();
    if (now < votingPeriod.startTime || now > votingPeriod.endTime) {
      return NextResponse.json(
        { message: '現在投票期間ではありません' },
        { status: 403 }
      );
    }

    const ipAddress = getClientIp(request);
    
    await prisma.vote.deleteMany({
      where: {
        ipAddress,
        projectId,
      },
    });

    return NextResponse.json({ message: '投票が正常に削除されました' });
  } catch (error: unknown) {
    console.error('Error removing vote:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: '投票の削除に失敗しました', error: errorMessage },
      { status: 500 }
    );
  }
}
